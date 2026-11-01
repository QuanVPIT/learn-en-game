import { useMemo } from 'react';

const PIECES = ['⭐', '🎉', '🦷', '✨', '🌈', '🎈', '😁'];

export function Confetti({ big }: { big?: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: big ? 40 : 18 }, (_, k) => ({
        k,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: 20 + Math.random() * 24,
      })),
    [big],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.k}
          className="absolute -top-12 animate-fall"
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, fontSize: p.size }}
        >
          {PIECES[p.k % PIECES.length]}
        </span>
      ))}
    </div>
  );
}
