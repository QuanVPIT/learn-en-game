// Các hàm tạo nội dung câu hỏi từ dữ liệu bài học
import { ACTIVITIES } from './activities';
import type { Activity, Topic, Word } from './types';
import { shuffle } from '../lib/random';

/** Lời thoại mẫu: câu hỏi (nếu có) và câu trả lời */
export function dialog(topic: Topic, w: Word): { q?: string; a: string } {
  const s = topic.sentence(w);
  if (!topic.ask) return { a: s };
  const ask = typeof topic.ask === 'function' ? topic.ask(w) : topic.ask;
  return s.endsWith('?') ? { q: s, a: ask } : { q: ask, a: s };
}

export const canSpell = (w: Word) => /^[a-z]+$/i.test(w.en);

const escapeRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Vị trí của `part` (nguyên từ, không phân biệt hoa thường) trong câu */
function locate(s: string, part: string): number {
  const m = new RegExp(`(^|[^a-z])(${escapeRe(part)})(?![a-z])`, 'i').exec(s);
  return m ? m.index + m[1].length : -1;
}

/** Phần bị che trong trò "Điền từ": từ chính, nếu không có trong câu thì dùng cụm `np` */
export function blankOf(topic: Topic, w: Word): string | null {
  const s = topic.sentence(w);
  for (const part of [w.en, w.np]) {
    const i = locate(s, part);
    if (i >= 0) return s.slice(i, i + part.length);
  }
  return null;
}

/** Câu có chỗ trống "____" và đáp án */
export function fillBlank(topic: Topic, w: Word) {
  const answer = blankOf(topic, w);
  if (!answer) return null;
  const s = topic.sentence(w);
  const i = locate(s, answer);
  return { before: s.slice(0, i), after: s.slice(i + answer.length), answer, full: s };
}

/** `n` lựa chọn gồm từ đúng và các từ khác cùng chủ đề (khác hình) */
export function pictureOptions(topic: Topic, word: Word, n = 4): Word[] {
  const others = shuffle(topic.words.filter((w) => w.en !== word.en && w.pic !== word.pic)).slice(0, n - 1);
  return shuffle([word, ...others]);
}

/** Lựa chọn cho trò Điền từ: các phần điền khác nhau trong cùng chủ đề */
export function blankOptions(topic: Topic, word: Word, n = 4): string[] {
  const answer = blankOf(topic, word)!;
  const pool = [...new Set(topic.words.map((w) => blankOf(topic, w)).filter((b): b is string => !!b && b !== answer))];
  return shuffle([answer, ...shuffle(pool).slice(0, n - 1)]);
}

/** Hai từ đầu của câu hỏi, để nhận ra các câu cùng kiểu hỏi (vd "where's the") */
const questionKind = (q = '') => q.toLowerCase().split(' ').slice(0, 2).join(' ');

/** Lựa chọn cho trò Hỏi – Đáp: câu đúng + câu trả lời của các chủ đề khác cùng lớp (khác kiểu câu hỏi) */
export function answerOptions(all: Topic[], topic: Topic, word: Word, n = 3): string[] {
  const d = dialog(topic, word);
  const kind = questionKind(d.q);
  const pool = all
    .filter((t) => t.grade === topic.grade && t.id !== topic.id && t.ask)
    .map((t) => dialog(t, t.words[Math.floor(Math.random() * t.words.length)]))
    .filter((o) => questionKind(o.q) !== kind && o.a !== d.a)
    .map((o) => o.a);
  return shuffle([d.a, ...shuffle([...new Set(pool)]).slice(0, n - 1)]);
}

/** Trò nào chơi được với chủ đề này */
export function activitiesFor(topic: Topic): Activity[] {
  const fillable = topic.words.filter((w) => blankOf(topic, w)).length >= 3;
  return ACTIVITIES.filter((a) => {
    if (a.id === 'qna') return !!topic.ask && topic.grade >= 3;
    if (a.id === 'fill') return fillable && topic.grade >= 3;
    return true;
  });
}
