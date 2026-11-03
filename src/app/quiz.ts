// Tạo bộ câu hỏi cho một lượt chơi
import { TOPICS, type Activity, type Lang, type Topic, type Word } from '../data';
import { activitiesFor, canSpell, dialog, fillBlank } from '../data/lessons';
import { levelOf, type LevelId } from '../data/levels';
import type { QuestionType } from '../games/types';
import { pick, shuffle } from '../lib/random';
import type { PlayerProgress } from './progress';

export const QUESTIONS = 8;

export interface QItem {
  topic: Topic;
  word: Word;
  type: QuestionType;
}

/** Các kiểu câu có thể dùng với một chủ đề (dùng cho Thử thách / Sổ ôn tập) */
function mixedTypes(topic: Topic, word: Word, withBuild: boolean): QuestionType[] {
  const allowed = new Set(activitiesFor(topic).map((a) => a.id));
  const types: QuestionType[] = ['listen', 'read', 'readSentence'];
  if (withBuild) types.push('sentence');
  if (withBuild && canSpell(word)) types.push('spell');
  if (allowed.has('fill') && fillBlank(topic, word)) types.push('fill');
  if (allowed.has('qna')) types.push('qna');
  return types;
}

/** 8 câu cho một trò; ưu tiên các từ bé hay sai (trong sổ ôn tập) */
export function buildQueue(topic: Topic, activity: Activity, progress?: PlayerProgress): QItem[] {
  const weak = new Set(
    Object.values(progress?.review ?? {})
      .filter((r) => r.topicId === topic.id)
      .map((r) => r.en),
  );
  let words = [
    ...shuffle(topic.words.filter((w) => weak.has(w.en))),
    ...shuffle(topic.words.filter((w) => !weak.has(w.en))),
  ];
  if (activity.id === 'spell' && words.some(canSpell)) words = words.filter(canSpell);
  if (activity.id === 'fill') words = words.filter((w) => fillBlank(topic, w));
  while (words.length < QUESTIONS) words = words.concat(shuffle(words));

  return shuffle(words.slice(0, QUESTIONS)).map((word, k) => {
    let type = activity.id as QuestionType | 'challenge';
    if (type === 'read') type = k % 2 ? 'readSentence' : 'read';
    if (type === 'challenge') type = pick(mixedTypes(topic, word, true));
    if (type === 'spell' && !canSpell(word)) type = 'sentence';
    return { topic, word, type: type as QuestionType };
  });
}

/** Sổ ôn tập: các từ bé hay sai nhất, ở mọi chủ đề */
export function buildReviewQueue(progress: PlayerProgress): QItem[] {
  return Object.values(progress.review)
    .sort((a, b) => b.wrong - a.wrong)
    .map((r) => {
      const topic = TOPICS.find((t) => t.id === r.topicId);
      const word = topic?.words.find((w) => w.en === r.en);
      return topic && word ? { topic, word, type: pick(mixedTypes(topic, word, false)) } : null;
    })
    .filter((x): x is QItem => !!x)
    .slice(0, QUESTIONS);
}

const BUILD_TYPES: QuestionType[] = ['spell', 'sentence', 'speak', 'speakSentence'];

/** Số giây cho một câu: trò ghép / xếp / nói được gấp 3 */
export const secondsFor = (type: QuestionType, level: LevelId) =>
  levelOf(level).seconds * (BUILD_TYPES.includes(type) ? 3 : 1);

/** Tóm tắt câu hỏi (không lộ đáp án) để báo câu sai ở màn kết quả */
export function promptOf(q: QItem): { pic?: string; text: string; audio?: { text: string; lang: Lang } } {
  const { topic, word } = q;
  const sentence = topic.sentence(word);
  switch (q.type) {
    case 'listen':
      return { text: 'Nghe từ rồi chọn hình', audio: { text: word.en, lang: 'en' } };
    case 'read':
      return { text: `Đọc từ: “${word.en}”` };
    case 'readSentence':
      return { text: `Đọc câu: “${sentence}”` };
    case 'spell':
      return { pic: word.pic, text: `Ghép chữ: ${word.vi}`, audio: { text: word.en, lang: 'en' } };
    case 'sentence':
      return { pic: word.pic, text: 'Nghe câu rồi xếp từ', audio: { text: sentence, lang: 'en' } };
    case 'fill': {
      const b = fillBlank(topic, word)!;
      return { pic: word.pic, text: `${b.before}____${b.after}` };
    }
    case 'qna': {
      const q2 = dialog(topic, word).q ?? sentence;
      return { pic: word.pic, text: q2, audio: { text: q2, lang: 'en' } };
    }
    case 'speak':
      return { pic: word.pic, text: `Nói từ: “${word.en}”` };
    case 'speakSentence':
      return { pic: word.pic, text: `Nói câu: “${sentence}”` };
  }
}
