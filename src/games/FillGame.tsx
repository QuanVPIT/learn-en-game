import { useEffect, useMemo } from 'react';
import { blankOptions, fillBlank } from '../data/lessons';
import { Pic } from '../components/Pic';
import { cx } from '../lib/cx';
import { ChoiceCard } from './ChoiceCard';
import { choiceState } from './choiceState';
import { useOnce } from './useOnce';
import type { GameProps } from './types';

/** Điền từ vào chỗ trống: đọc câu có chỗ trống, chọn từ đúng */
export function FillGame({ topic, word, onAnswer, onReady }: GameProps) {
  const blank = fillBlank(topic, word)!;
  const opts = useMemo(() => blankOptions(topic, word, 4), [word]);
  const [picked, choose] = useOnce<string>();
  const correct = picked === blank.answer;

  useEffect(onReady, []);

  return (
    <>
      <span className="rounded-[28px] bg-white px-4 py-1 text-[clamp(60px,15vw,100px)] leading-tight shadow-[0_6px_0_#0002]">
        <Pic pic={word.pic} />
      </span>
      <div className="max-w-3xl rounded-[28px] bg-white px-6 py-3 text-center text-[clamp(22px,5.5vw,36px)] leading-snug font-extrabold shadow-[0_6px_0_#0002]">
        {blank.before}
        <span
          className={cx(
            'mx-1 inline-block min-w-24 border-b-4 border-dashed px-1',
            picked == null ? 'border-brand' : correct ? 'border-good text-good' : 'border-bad text-bad line-through',
          )}
        >
          {picked ?? ' '}
        </span>
        {blank.after}
        <small className="block text-base font-bold opacity-70">Chọn từ điền vào chỗ trống</small>
      </div>
      <div className="grid w-full max-w-3xl flex-1 grid-cols-1 content-center gap-3 sm:grid-cols-2">
        {opts.map((o) => (
          <ChoiceCard
            key={o}
            text
            state={choiceState(o, picked, correct)}
            onClick={() => choose(o, () => (o === blank.answer ? onAnswer(true, blank.full) : onAnswer(false)))}
          >
            {o}
          </ChoiceCard>
        ))}
      </div>
    </>
  );
}
