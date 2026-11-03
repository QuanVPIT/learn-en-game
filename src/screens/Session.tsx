import { useEffect, useRef, useState } from 'react';
import { TOPICS } from '../data';
import { BADGES } from '../data/badges';
import { PROMPTS } from '../data/phrases';
import type { LevelId } from '../data/levels';
import { usePlayer } from '../app/player';
import { starsFor } from '../app/progress';
import { promptOf, secondsFor, type QItem } from '../app/quiz';
import { cx } from '../lib/cx';
import { cheer, finishLines, tease } from '../lib/praise';
import { wait } from '../lib/random';
import { sfx } from '../lib/sfx';
import { useAlive } from '../lib/useAlive';
import { speak, speakAll } from '../lib/voice';
import { Confetti } from '../components/Confetti';
import { Pic } from '../components/Pic';
import { BigButton, Pill, Screen, Stars, Title, TopBar } from '../components/ui';
import { ChooseGame } from '../games/ChooseGame';
import { SentenceGame, SpellGame } from '../games/BuildGames';
import { FillGame } from '../games/FillGame';
import { QnaGame } from '../games/QnaGame';
import { SpeakGame } from '../games/SpeakGame';

export type SessionMode = 'normal' | 'retry' | 'review';

interface Props {
  items: QItem[];
  mode: SessionMode;
  level: LevelId;
  onAnswer: (item: QItem, correct: boolean) => void;
  /** Lượt chơi xong; trả về các huy hiệu mới đạt */
  onFinish: (correct: number, total: number) => string[];
  onRetry: (wrong: QItem[]) => void;
  onRestart: () => void;
  onBack: () => void;
}

/** Một lượt chơi: mỗi câu trả lời 1 lần, có đồng hồ; cuối lượt báo điểm và các câu sai */
export function Session({ items, mode, level, onAnswer, onFinish, onRetry, onRestart, onBack }: Props) {
  const player = usePlayer();
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState('');
  const [confetti, setConfetti] = useState(0);
  const [answered, setAnswered] = useState<'right' | 'wrong' | 'timeout' | null>(null);
  const [wrong, setWrong] = useState<QItem[]>([]);
  const [done, setDone] = useState<{ correct: number; badges: string[] } | null>(null);
  const [timer, setTimer] = useState<{ total: number; left: number; running: boolean } | null>(null);
  const answeredRef = useRef(false);
  const alive = useAlive();
  const q = items[i];

  useEffect(() => {
    if (mode !== 'normal') void speak(mode === 'review' ? PROMPTS.review(player) : PROMPTS.retry(player), 'vi');
  }, []);

  // ---------- Đồng hồ ----------
  const startTimer = () => {
    if (answeredRef.current) return;
    const total = secondsFor(q.type, level);
    setTimer({ total, left: total, running: true });
  };
  const pauseTimer = () => setTimer((t) => (t ? { ...t, running: false } : t));

  useEffect(() => {
    if (!timer?.running) return;
    if (timer.left <= 0) {
      void answer(false, null, true);
      return;
    }
    const id = setTimeout(() => {
      setTimer((t) => (t && t.running ? { ...t, left: Math.max(0, +(t.left - 0.1).toFixed(1)) } : t));
      // Tích tắc 3 giây cuối (khi câu có hơn 3 giây)
      if (timer.total > 3 && timer.left <= 3.05 && Math.abs(timer.left - Math.round(timer.left)) < 0.05) sfx.tick();
    }, 100);
    return () => clearTimeout(id);
  }, [timer]);

  // ---------- Trả lời ----------
  async function answer(correct: boolean, say?: string | null, timeout = false) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    pauseTimer();
    setAnswered(correct ? 'right' : timeout ? 'timeout' : 'wrong');
    onAnswer(q, correct);
    const wrongNow = correct ? wrong : [...wrong, q];
    if (!correct) setWrong(wrongNow);

    if (correct) {
      setConfetti((c) => c + 1);
      const c = cheer(player);
      setMsg(c.text);
      if (say) await speak(say, 'en');
      if (!alive.current) return;
      await speak(c.text, c.lang, { queue: true });
    } else {
      const t = tease(player, timeout);
      setMsg(t);
      await wait(timeout ? 300 : 1100); // nghe hết tiếng kèn "oa oa"
      if (!alive.current) return;
      await speak(t, 'vi');
    }
    await wait(350);
    if (!alive.current) return;

    if (i + 1 < items.length) {
      answeredRef.current = false;
      setAnswered(null);
      setTimer(null);
      setMsg('');
      setI(i + 1);
    } else {
      const correctCount = items.length - wrongNow.length;
      const badges = onFinish(correctCount, items.length);
      setDone({ correct: correctCount, badges });
      const lines = finishLines(player, starsFor(correctCount, items.length)).map((text) => ({
        text,
        lang: 'vi' as const,
      }));
      badges.forEach((id) =>
        lines.push({ text: PROMPTS.badge(player, BADGES.find((b) => b.id === id)!.name), lang: 'vi' }),
      );
      void speakAll(lines);
    }
  }

  // ---------- Kết quả ----------
  if (done) {
    const stars = starsFor(done.correct, items.length);
    return (
      <Screen scroll className="justify-start">
        <div className="mt-6 text-center">
          {mode === 'normal' ? (
            <Stars count={stars} className="text-[clamp(60px,15vw,96px)] [&>span]:animate-pop" />
          ) : (
            <div className="text-[clamp(60px,15vw,96px)]">{done.correct === items.length ? '🏆' : '💪'}</div>
          )}
        </div>
        <Title>
          {done.correct}/{items.length} câu đúng
        </Title>
        <p className="m-0 text-center text-xl font-bold">
          {wrong.length === 0 ? `${player.name} đúng hết luôn! 🎉` : `${player.name} sai ${wrong.length} câu:`}
        </p>

        {wrong.length > 0 && (
          <div className="flex w-full max-w-xl flex-col gap-2">
            {wrong.map((w, k) => {
              const p = promptOf(w);
              return (
                <div key={k} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-[0_4px_0_#0002]">
                  <span className="w-7 text-center text-lg font-extrabold text-bad">✗</span>
                  {p.pic && (
                    <span className="text-4xl leading-none">
                      <Pic pic={p.pic} />
                    </span>
                  )}
                  <span className="flex-1 text-lg leading-snug font-bold">{p.text}</span>
                  {p.audio && (
                    <button
                      className="text-2xl"
                      onClick={() => speak(p.audio!.text, p.audio!.lang)}
                      aria-label="Nghe lại"
                    >
                      🔊
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {done.badges.length > 0 && (
          <div className="flex w-full max-w-xl animate-pop flex-col items-center gap-1 rounded-3xl border-4 border-sun bg-amber-50 p-3">
            <b className="text-lg">🏅 Huy hiệu mới!</b>
            <div className="flex flex-wrap justify-center gap-3">
              {done.badges.map((id) => {
                const b = BADGES.find((x) => x.id === id)!;
                return (
                  <span key={id} className="flex flex-col items-center">
                    <span className="text-5xl">{b.icon}</span>
                    <span className="font-extrabold">{b.name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 pb-4">
          {wrong.length > 0 && (
            <BigButton small onClick={() => onRetry(wrong)}>
              🔁 Làm lại câu sai
            </BigButton>
          )}
          {mode === 'normal' && (
            <BigButton small alt onClick={onRestart}>
              🔄 Chơi lại từ đầu
            </BigButton>
          )}
          <Pill onClick={onBack}>⬅ Quay lại</Pill>
        </div>
        {(stars === 3 || done.badges.length > 0) && <Confetti big />}
      </Screen>
    );
  }

  // ---------- Đang chơi ----------
  const props = { topic: q.topic, word: q.word, onAnswer: answer, onReady: startTimer, pauseTimer };
  const pct = timer ? (timer.left / timer.total) * 100 : 100;

  return (
    <Screen>
      <TopBar onBack={onBack}>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sun to-brand transition-[width] duration-500"
            style={{ width: `${(i / items.length) * 100}%` }}
          />
        </div>
        <div className="rounded-full bg-white px-3.5 text-xl font-extrabold">
          {i + 1}/{items.length}
        </div>
      </TopBar>

      {/* Đồng hồ đếm ngược */}
      <div className="flex w-full max-w-4xl flex-none items-center gap-2">
        <span className={cx('text-2xl', timer?.running && timer.left <= 3 && 'animate-wiggle')}>⏰</span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/70">
          <div
            className={cx(
              'h-full rounded-full transition-[width] duration-100 ease-linear',
              pct > 50 ? 'bg-good' : pct > 25 ? 'bg-sun' : 'bg-bad',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="w-10 text-right text-lg font-extrabold tabular-nums">
          {timer ? Math.ceil(timer.left) : ''}
        </span>
      </div>

      <div key={`q${i}`} className="relative flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center gap-3.5">
        {q.type === 'listen' && <ChooseGame {...props} mode="listen" />}
        {q.type === 'read' && <ChooseGame {...props} mode="read" />}
        {q.type === 'readSentence' && <ChooseGame {...props} mode="readSentence" />}
        {q.type === 'spell' && <SpellGame {...props} />}
        {q.type === 'sentence' && <SentenceGame {...props} />}
        {q.type === 'fill' && <FillGame {...props} />}
        {q.type === 'qna' && <QnaGame {...props} topics={TOPICS} />}
        {q.type === 'speak' && <SpeakGame {...props} />}
        {q.type === 'speakSentence' && <SpeakGame {...props} sentenceMode />}
        {/* Đã trả lời / hết giờ: chặn chạm thêm */}
        {answered && <div className="absolute inset-0 z-10" />}
        {answered === 'timeout' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="animate-pop rounded-3xl bg-white px-8 py-4 text-4xl font-extrabold text-bad shadow-[0_8px_0_#0002]">
              ⏰ Hết giờ!
            </span>
          </div>
        )}
      </div>

      <div
        className={cx(
          'min-h-9 flex-none text-center text-[clamp(17px,4.2vw,26px)] font-extrabold [text-shadow:2px_2px_0_#fff]',
          answered === 'right' ? 'text-good' : 'text-heading',
        )}
      >
        {msg}
      </div>
      {confetti > 0 && <Confetti key={`c${confetti}`} />}
    </Screen>
  );
}
