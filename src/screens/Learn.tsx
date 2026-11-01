import { useEffect, useState } from 'react';
import type { Topic } from '../data';
import { speakAll } from '../lib/voice';
import { Dialog } from '../components/Dialog';
import { Pic } from '../components/Pic';
import { BigButton, RoundButton, Screen, TopBar } from '../components/ui';

/** Thẻ từ: hình, từ tiếng Anh, nghĩa và hội thoại mẫu */
export function Learn({ topic, onBack, onPractice }: { topic: Topic; onBack: () => void; onPractice: () => void }) {
  const [i, setI] = useState(0);
  const w = topic.words[i];
  const last = i === topic.words.length - 1;
  const say = () =>
    speakAll([
      { text: w.en, lang: 'en' },
      { text: w.vi, lang: 'vi' },
    ]);

  useEffect(() => {
    void say();
  }, [i]);

  return (
    <Screen>
      <TopBar onBack={onBack}>
        <div className="rounded-full bg-white px-3.5 text-xl font-extrabold">
          {i + 1} / {topic.words.length}
        </div>
      </TopBar>

      <button
        key={i}
        onClick={say}
        className="mt-2 flex animate-pop flex-col items-center rounded-[36px] bg-white px-12 pt-4 pb-3 shadow-[0_8px_0_#0002]"
      >
        <span className="text-[clamp(110px,28vw,180px)] leading-tight">
          <Pic pic={w.pic} />
        </span>
        <span className="text-center text-[clamp(34px,9vw,60px)] leading-tight font-extrabold text-heading">
          {w.en}
        </span>
        <span className="text-[clamp(18px,4.5vw,24px)] font-bold opacity-70">{w.vi}</span>
      </button>

      <Dialog topic={topic} word={w} />

      <div className="flex flex-wrap items-center justify-center gap-4">
        <RoundButton disabled={i === 0} onClick={() => setI(i - 1)}>
          ◀
        </RoundButton>
        <RoundButton onClick={say}>🔊</RoundButton>
        {last ? (
          <BigButton small onClick={onPractice}>
            🎧 Chơi thôi!
          </BigButton>
        ) : (
          <RoundButton onClick={() => setI(i + 1)}>▶</RoundButton>
        )}
      </div>
    </Screen>
  );
}
