import { useEffect, useMemo, useState } from 'react';
import type { Topic } from '../data';
import { answerOptions, dialog } from '../data/lessons';
import { speak } from '../lib/voice';
import { Pic } from '../components/Pic';
import { Pill } from '../components/ui';
import { ChoiceCard } from './ChoiceCard';
import { choiceState } from './choiceState';
import type { GameProps } from './types';

/** Hỏi – Đáp: nghe câu hỏi, chọn câu trả lời đúng */
export function QnaGame({ topic, word, topics, onRight, onWrong }: GameProps & { topics: Topic[] }) {
  const d = dialog(topic, word);
  const question = d.q ?? d.a;
  const opts = useMemo(() => answerOptions(topics, topic, word, 3), [word]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const hear = () => speak(question, 'en');

  useEffect(() => {
    void hear();
  }, []);

  const tap = (o: string) => {
    if (done || wrong.includes(o)) return;
    if (o === d.a) {
      setDone(true);
      onRight(d.a);
    } else {
      setWrong([...wrong, o]);
      onWrong();
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="rounded-[24px] bg-white px-3 py-1 text-[clamp(50px,12vw,80px)] leading-tight shadow-[0_6px_0_#0002]">
          <Pic pic={word.pic} />
        </span>
        <div className="flex flex-col items-start gap-2">
          <div className="rounded-[24px] rounded-bl-none bg-white px-5 py-2 text-[clamp(20px,5vw,32px)] leading-snug font-extrabold text-heading shadow-[0_5px_0_#0002]">
            {question}
          </div>
          <Pill onClick={hear}>🔊 Nghe câu hỏi</Pill>
        </div>
      </div>
      <p className="m-0 font-bold opacity-75">Chọn câu trả lời đúng:</p>
      <div className="grid w-full max-w-3xl flex-1 grid-cols-1 content-center gap-3">
        {opts.map((o) => (
          <ChoiceCard key={o} text state={choiceState(o, d.a, wrong, done)} onClick={() => tap(o)}>
            ↪️ {o}
          </ChoiceCard>
        ))}
      </div>
    </>
  );
}
