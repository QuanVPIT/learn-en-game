import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { shuffle } from '../lib/random';
import { sfx } from '../lib/sfx';
import { speak } from '../lib/voice';
import { Pic } from '../components/Pic';
import { Pill } from '../components/ui';
import { cx } from '../lib/cx';
import type { GameProps } from './types';

/** Chạm từng mảnh (chữ cái hoặc từ) theo đúng thứ tự */
function Builder({
  parts,
  onAnswer,
  sayDone,
  wide,
}: {
  parts: string[];
  onAnswer: GameProps['onAnswer'];
  sayDone: string;
  wide?: boolean;
}) {
  const tiles = useMemo(() => shuffle(parts.map((t, k) => ({ t, k }))), []);
  const [used, setUsed] = useState<number[]>([]);
  // Chạm sai một mảnh là hết lượt câu này
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const filled = used.length;
  const done = filled === parts.length;
  const over = done || wrongTile != null;

  const tap = (tile: { t: string; k: number }) => {
    if (over || used.includes(tile.k)) return;
    if (tile.t.toLowerCase() === parts[filled].toLowerCase()) {
      sfx.pop();
      const next = [...used, tile.k];
      setUsed(next);
      if (next.length === parts.length) onAnswer(true, sayDone);
    } else {
      setWrongTile(tile.k);
      onAnswer(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {parts.map((p, k) => (
          <span
            key={k}
            className={cx(
              'flex items-center justify-center rounded-[14px] border-[3px] px-2 font-extrabold text-heading',
              wide
                ? 'h-[clamp(46px,11vw,64px)] min-w-[clamp(50px,12vw,80px)] text-[clamp(18px,4.5vw,30px)]'
                : 'h-[clamp(52px,13vw,72px)] min-w-[clamp(40px,10vw,60px)] text-[clamp(28px,7vw,44px)]',
              done
                ? 'border-solid border-good bg-good-soft'
                : wrongTile != null
                  ? 'border-solid border-bad bg-bad-soft'
                  : k < filled
                    ? 'animate-pop border-solid border-violet bg-white'
                    : k === filled
                      ? 'animate-blink border-dashed border-brand bg-white/50'
                      : 'border-dashed border-violet bg-white/50',
            )}
          >
            {k < filled ? p : ''}
          </span>
        ))}
      </div>
      <div className="flex max-w-2xl flex-wrap justify-center gap-2.5">
        {tiles.map((tile) => (
          <button
            key={tile.k}
            onClick={() => tap(tile)}
            className={cx(
              'h-[clamp(50px,12vw,70px)] min-w-[clamp(50px,12vw,70px)] rounded-[18px] px-3 font-extrabold active:translate-y-1',
              wide
                ? 'bg-[#b8a1ff] text-[clamp(18px,4.5vw,28px)] shadow-[0_6px_0_#8a6fe0]'
                : 'bg-sun text-[clamp(26px,7vw,40px)] shadow-[0_6px_0_var(--color-sun-dark)]',
              used.includes(tile.k) && 'invisible',
              wrongTile === tile.k && 'animate-shake !bg-[#ff9aa2]',
            )}
          >
            {tile.t}
          </button>
        ))}
      </div>
    </>
  );
}

function Prompt({ pic, children }: { pic: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className="rounded-[28px] bg-white px-4 py-2 text-[clamp(70px,18vw,120px)] leading-tight shadow-[0_6px_0_#0002]">
        <Pic pic={pic} />
      </span>
      <div className="flex flex-col items-start gap-2">{children}</div>
    </div>
  );
}

/** Ghép chữ cái thành từ */
export function SpellGame({ word, onAnswer, onReady }: GameProps) {
  useEffect(() => {
    void speak(word.en, 'en').then(onReady);
  }, []);
  return (
    <>
      <Prompt pic={word.pic}>
        <Pill onClick={() => speak(word.en, 'en')}>🔊 Nghe</Pill>
        <span className="text-lg font-bold opacity-75">{word.vi}</span>
      </Prompt>
      <Builder parts={word.en.split('')} onAnswer={onAnswer} sayDone={word.en} />
    </>
  );
}

/** Nghe câu, xếp các từ thành câu */
export function SentenceGame({ topic, word, onAnswer, onReady }: GameProps) {
  const sentence = topic.sentence(word);
  useEffect(() => {
    void speak(sentence, 'en').then(onReady);
  }, []);
  return (
    <>
      <Prompt pic={word.pic}>
        <Pill onClick={() => speak(sentence, 'en')}>🔊 Nghe câu</Pill>
        <span className="text-lg font-bold opacity-75">Xếp các từ thành câu</span>
      </Prompt>
      <Builder parts={sentence.split(' ')} onAnswer={onAnswer} sayDone={sentence} wide />
    </>
  );
}
