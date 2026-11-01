import { useEffect, useMemo, useState } from 'react';
import { pictureOptions } from '../data/lessons';
import { speak } from '../lib/voice';
import { Pic } from '../components/Pic';
import { ChoiceCard } from './ChoiceCard';
import { choiceState } from './choiceState';
import type { GameProps } from './types';

const BOX =
  'flex flex-col items-center rounded-[28px] bg-white px-9 py-1.5 text-center leading-tight font-extrabold text-heading shadow-[0_6px_0_#0002]';
const HINT = 'text-base font-bold text-ink opacity-70';

/** Nghe từ / đọc từ / đọc câu rồi chọn hình đúng */
export function ChooseGame({
  topic,
  word,
  mode,
  onRight,
  onWrong,
}: GameProps & { mode: 'listen' | 'read' | 'readSentence' }) {
  const opts = useMemo(() => pictureOptions(topic, word, 4), [word]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const sentence = topic.sentence(word);
  const hear = () => speak(mode === 'listen' ? word.en : sentence, 'en');

  useEffect(() => {
    if (mode === 'listen') void hear();
  }, []);

  const tap = (en: string) => {
    if (done || wrong.includes(en)) return;
    if (en === word.en) {
      setDone(true);
      onRight(mode === 'listen' ? null : mode === 'read' ? word.en : sentence);
    } else {
      setWrong([...wrong, en]);
      onWrong();
    }
  };

  return (
    <>
      {mode === 'listen' && (
        <button
          onClick={hear}
          className="flex animate-breathe flex-col items-center rounded-[32px] border-4 border-sky-300 bg-white px-10 py-2 text-[clamp(70px,18vw,110px)] leading-tight shadow-[0_6px_0_var(--color-sky-300)]"
        >
          🔊<small className={HINT}>Nghe rồi chọn hình</small>
        </button>
      )}
      {mode === 'read' && (
        <div className={BOX + ' text-[clamp(36px,9vw,60px)]'}>
          {word.en}
          <small className={HINT}>Đọc rồi chọn hình</small>
        </div>
      )}
      {mode === 'readSentence' && (
        <div className={BOX + ' text-[clamp(24px,6vw,40px)]'}>
          {sentence}
          <small className={HINT}>Đọc câu rồi chọn hình</small>
        </div>
      )}
      <div className="grid w-full flex-1 grid-cols-2 content-center gap-3 sm:grid-cols-4">
        {opts.map((w) => {
          const state = choiceState(w.en, word.en, wrong, done);
          return (
            <ChoiceCard key={w.en} state={state} onClick={() => tap(w.en)} label={state !== 'idle' ? w.en : undefined}>
              <Pic pic={w.pic} />
            </ChoiceCard>
          );
        })}
      </div>
    </>
  );
}
