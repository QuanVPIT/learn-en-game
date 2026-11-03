import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import type { ChoiceState } from './choiceState';

/** Ô lựa chọn: hình (vuông) hoặc chữ (dài) */
export function ChoiceCard({
  state,
  onClick,
  children,
  text,
}: {
  state: ChoiceState;
  onClick: () => void;
  children: ReactNode;
  /** Ô chữ (câu trả lời) thay vì ô hình */
  text?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'relative flex w-full items-center justify-center rounded-[28px] bg-white shadow-[0_7px_0_#0002] transition active:scale-95',
        text
          ? 'min-h-16 px-4 py-3 text-left text-[clamp(18px,4.5vw,26px)] font-bold'
          : 'aspect-square max-h-[30vh] justify-self-center text-[clamp(54px,14vw,110px)]',
        state === 'right' && 'animate-jump bg-good-soft shadow-[0_0_0_6px_var(--color-good),0_7px_0_#0002]',
        state === 'wrong' && 'animate-shake bg-bad-soft opacity-55',
        state === 'faded' && 'opacity-30',
      )}
    >
      {children}
    </button>
  );
}
