import { useEffect } from 'react';
import { PLAYERS, type Player } from '../data';
import { PROMPTS } from '../data/phrases';
import { speak } from '../lib/voice';
import { Screen } from '../components/ui';

/** Màn chào: chọn bé đang chơi */
export function Welcome({ onPick }: { onPick: (p: Player) => void }) {
  useEffect(() => {
    void speak(PROMPTS.welcome, 'vi');
  }, []);

  return (
    <Screen className="justify-center text-center">
      <div className="animate-wiggle text-[clamp(90px,22vw,150px)] leading-none">👋</div>
      <h1 className="m-0 text-[clamp(36px,9vw,68px)] leading-tight font-extrabold text-violet [text-shadow:3px_3px_0_#fff]">
        Xin Chào
        <br />
        <span className="inline-block animate-hop text-[1.15em] text-brand">các bé!</span>
      </h1>
      <p className="m-0 text-[clamp(16px,4vw,22px)] font-bold">🇬🇧 Let's learn English! Bé nào đang chơi?</p>
      <div className="mt-2 flex flex-wrap justify-center gap-5">
        {PLAYERS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onPick(p)}
            className="flex w-[clamp(150px,40vw,220px)] animate-breathe flex-col items-center rounded-[32px] px-2.5 py-3.5 text-white active:translate-y-1.5"
            style={{ background: p.color, boxShadow: `0 8px 0 ${p.shadow}`, animationDelay: `${i * 0.8}s` }}
          >
            <span className="text-[clamp(64px,16vw,96px)] leading-tight">{p.face}</span>
            <span className="text-[clamp(20px,5vw,28px)] font-extrabold [text-shadow:2px_2px_0_#0003]">{p.name}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
