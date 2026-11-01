import { useMemo, useState } from 'react';
import { blankOptions, fillBlank } from '../data/lessons';
import { speak } from '../lib/voice';
import { Pic } from '../components/Pic';
import { ChoiceCard } from './ChoiceCard';
import { choiceState } from './choiceState';
import type { GameProps } from './types';

/** Điền từ vào chỗ trống: đọc câu có chỗ trống, chọn từ đúng */
export function FillGame({ topic, word, onRight, onWrong }: GameProps) {
  const blank = fillBlank(topic, word)!;
  const opts = useMemo(() => blankOptions(topic, word, 4), [word]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const tap = (o: string) => {
    if (done || wrong.includes(o)) return;
    if (o === blank.answer) {
      setDone(true);
      onRight(blank.full);
    } else {
      setWrong([...wrong, o]);
      onWrong();
    }
  };

  return (
    <>
      <span className="rounded-[28px] bg-white px-4 py-1 text-[clamp(60px,15vw,100px)] leading-tight shadow-[0_6px_0_#0002]">
        <Pic pic={word.pic} />
      </span>
      <button
        onClick={() => done && speak(blank.full, 'en')}
        className="max-w-3xl rounded-[28px] bg-white px-6 py-3 text-center text-[clamp(22px,5.5vw,36px)] leading-snug font-extrabold shadow-[0_6px_0_#0002]"
      >
        {blank.before}
        <span className="mx-1 inline-block min-w-24 border-b-4 border-dashed border-brand px-1 text-heading">
          {done ? blank.answer : ' '}
        </span>
        {blank.after}
        <small className="block text-base font-bold opacity-70">Chọn từ điền vào chỗ trống</small>
      </button>
      <div className="grid w-full max-w-3xl flex-1 grid-cols-1 content-center gap-3 sm:grid-cols-2">
        {opts.map((o) => (
          <ChoiceCard key={o} text state={choiceState(o, blank.answer, wrong, done)} onClick={() => tap(o)}>
            {o}
          </ChoiceCard>
        ))}
      </div>
    </>
  );
}
