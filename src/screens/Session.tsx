import { useMemo, useRef, useState } from 'react';
import { TOPICS, type Activity, type Topic } from '../data';
import { activitiesFor, canSpell } from '../data/lessons';
import { usePlayer } from '../app/player';
import { cheer, finishLines, oops } from '../lib/praise';
import { pick, shuffle, wait } from '../lib/random';
import { sfx } from '../lib/sfx';
import { useAlive } from '../lib/useAlive';
import { speak, speakAll } from '../lib/voice';
import { Confetti } from '../components/Confetti';
import { BigButton, Screen, Stars, Title, TopBar } from '../components/ui';
import { ChooseGame } from '../games/ChooseGame';
import { SpellGame, SentenceGame } from '../games/BuildGames';
import { FillGame } from '../games/FillGame';
import { QnaGame } from '../games/QnaGame';
import { SpeakGame } from '../games/SpeakGame';
import type { QuestionType } from '../games/types';

const QUESTIONS = 8;

/** Danh sách 8 câu hỏi cho một lượt chơi */
function buildQueue(topic: Topic, activity: Activity) {
  const allowed = new Set(activitiesFor(topic).map((a) => a.id));
  const mixed: QuestionType[] = ['listen', 'read', 'readSentence', 'spell', 'sentence'];
  if (allowed.has('fill')) mixed.push('fill');
  if (allowed.has('qna')) mixed.push('qna');

  let words = shuffle(topic.words);
  // Ghép chữ chỉ dùng từ đơn; chủ đề toàn cụm từ thì chuyển sang xếp câu
  if (activity.id === 'spell' && words.some(canSpell)) words = words.filter(canSpell);
  while (words.length < QUESTIONS) words = words.concat(shuffle(words));

  return words.slice(0, QUESTIONS).map((word, k) => {
    let type = activity.id as QuestionType | 'challenge';
    if (type === 'read') type = k % 2 ? 'readSentence' : 'read';
    if (type === 'challenge') type = pick(mixed);
    if (type === 'spell' && !canSpell(word)) type = 'sentence';
    return { word, type: type as QuestionType };
  });
}

/** Một lượt chơi 8 câu, cuối lượt chấm 1–3 sao */
export function Session({
  topic,
  activity,
  onBack,
  onReplay,
  onStars,
}: {
  topic: Topic;
  activity: Activity;
  onBack: () => void;
  onReplay: () => void;
  onStars: (n: number) => void;
}) {
  const player = usePlayer();
  const queue = useMemo(() => buildQueue(topic, activity), []);
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState('');
  const [confetti, setConfetti] = useState(0);
  const [result, setResult] = useState<1 | 2 | 3 | null>(null);
  const mistakes = useRef(0); // số câu có làm sai
  const wrongHere = useRef(false);
  const locked = useRef(false);
  const alive = useAlive();
  const q = queue[i];

  const onWrong = (quiet?: boolean) => {
    wrongHere.current = true;
    if (quiet) return sfx.buzz();
    const t = oops(player);
    setMsg(t);
    void speak(t, 'vi');
  };

  const onRight = async (say?: string | null) => {
    if (locked.current) return;
    locked.current = true;
    if (wrongHere.current) mistakes.current += 1;
    wrongHere.current = false;
    setConfetti((c) => c + 1);
    const c = cheer(player);
    setMsg(c.text);
    if (say) await speak(say, 'en');
    if (!alive.current) return;
    await speak(c.text, c.lang, { queue: true });
    await wait(300);
    if (!alive.current) return;
    if (i + 1 < queue.length) {
      setMsg('');
      setI(i + 1);
      locked.current = false;
    } else {
      const m = mistakes.current;
      const stars = m <= 1 ? 3 : m <= 3 ? 2 : 1;
      setResult(stars);
      onStars(stars);
      void speakAll(finishLines(player, stars).map((text) => ({ text, lang: 'vi' as const })));
    }
  };

  if (result) {
    return (
      <Screen className="justify-center">
        <Stars count={result} className="text-[clamp(70px,18vw,110px)] [&>span]:animate-pop" />
        <Title>{result === 3 ? 'Tuyệt cú mèo!' : result === 2 ? 'Giỏi lắm!' : 'Cố lên nào!'}</Title>
        <p className="m-0 text-xl font-bold">
          {mistakes.current === 0 ? 'Không sai câu nào luôn!' : `${player.name} làm sai ${mistakes.current} câu`}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <BigButton small onClick={onReplay}>
            🔁 Chơi lại
          </BigButton>
          <BigButton small alt onClick={onBack}>
            ⬅ Trò khác
          </BigButton>
        </div>
        <Confetti big />
      </Screen>
    );
  }

  const props = { topic, word: q.word, onRight, onWrong };

  return (
    <Screen>
      <TopBar onBack={onBack}>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sun to-brand transition-[width] duration-500"
            style={{ width: `${(i / queue.length) * 100}%` }}
          />
        </div>
        <div className="rounded-full bg-white px-3.5 text-xl font-extrabold">
          {i + 1}/{queue.length}
        </div>
      </TopBar>

      <div key={`q${i}`} className="flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center gap-3.5">
        {q.type === 'listen' && <ChooseGame {...props} mode="listen" />}
        {q.type === 'read' && <ChooseGame {...props} mode="read" />}
        {q.type === 'readSentence' && <ChooseGame {...props} mode="readSentence" />}
        {q.type === 'spell' && <SpellGame {...props} />}
        {q.type === 'sentence' && <SentenceGame {...props} />}
        {q.type === 'fill' && <FillGame {...props} />}
        {q.type === 'qna' && <QnaGame {...props} topics={TOPICS} />}
        {q.type === 'speak' && <SpeakGame {...props} />}
        {q.type === 'speakSentence' && <SpeakGame {...props} sentenceMode />}
      </div>

      <div className="min-h-9 flex-none text-center text-[clamp(17px,4.2vw,26px)] font-extrabold text-heading [text-shadow:2px_2px_0_#fff]">
        {msg}
      </div>
      {confetti > 0 && <Confetti key={`c${confetti}`} />}
    </Screen>
  );
}
