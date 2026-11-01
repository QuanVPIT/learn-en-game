// Các nút và khung dùng chung
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../lib/cx';

type Btn = ButtonHTMLAttributes<HTMLButtonElement>;

export function BigButton({ small, alt, className, ...rest }: Btn & { small?: boolean; alt?: boolean }) {
  return (
    <button
      {...rest}
      className={cx(
        'rounded-full font-extrabold text-white active:translate-y-1.5',
        small ? 'px-6 py-2 text-[clamp(18px,4.5vw,24px)]' : 'px-10 py-3 text-[clamp(24px,6vw,36px)]',
        alt
          ? 'bg-violet shadow-[0_7px_0_var(--color-violet-dark)] active:shadow-[0_2px_0_var(--color-violet-dark)]'
          : 'bg-brand shadow-[0_7px_0_var(--color-brand-dark)] active:shadow-[0_2px_0_var(--color-brand-dark)]',
        className,
      )}
    />
  );
}

export function Pill({ className, ...rest }: Btn) {
  return (
    <button
      {...rest}
      className={cx(
        'rounded-full bg-white px-4 py-1.5 text-[clamp(16px,4vw,22px)] font-bold shadow-[0_4px_0_#0002] active:translate-y-1',
        className,
      )}
    />
  );
}

export function RoundButton({ className, ...rest }: Btn) {
  return (
    <button
      {...rest}
      className={cx('size-16 rounded-full bg-white text-3xl shadow-[0_5px_0_#0002] active:translate-y-1', className)}
    />
  );
}

export function Screen({ children, scroll, className }: { children: ReactNode; scroll?: boolean; className?: string }) {
  return (
    <div
      className={cx(
        'relative flex h-full flex-col items-center gap-3 p-4',
        scroll && 'overflow-y-auto pb-8',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TopBar({ onBack, children }: { onBack: () => void; children?: ReactNode }) {
  return (
    <div className="z-[5] flex w-full flex-none items-center gap-3 pr-16">
      <button
        onClick={onBack}
        aria-label="Quay lại"
        className="size-[50px] flex-none rounded-full bg-white text-2xl shadow-[0_4px_0_#0002]"
      >
        ⬅
      </button>
      {children}
    </div>
  );
}

export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cx(
        'm-0 text-[clamp(22px,5.5vw,36px)] font-extrabold text-heading [text-shadow:2px_2px_0_#fff]',
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function Stars({ count, total = 3, className }: { count: number; total?: number; className?: string }) {
  return (
    <span className={cx('inline-flex gap-0.5', className)}>
      {Array.from({ length: total }, (_, k) => (
        <span key={k} className={k < count ? '' : 'opacity-35 grayscale'}>
          ⭐
        </span>
      ))}
    </span>
  );
}
