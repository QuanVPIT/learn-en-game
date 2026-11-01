// Hội thoại mẫu: câu hỏi và câu trả lời (chạm để nghe)
import type { Topic, Word } from '../data';
import { dialog } from '../data/lessons';
import { speakAll } from '../lib/voice';

export function Dialog({ topic, word }: { topic: Topic; word: Word }) {
  const d = dialog(topic, word);
  const lines = d.q ? [d.q, d.a] : [d.a];
  return (
    <button
      className="flex w-full max-w-xl flex-col gap-1.5"
      onClick={() => speakAll(lines.map((text) => ({ text, lang: 'en' })))}
    >
      {lines.map((l, k) => (
        <span
          key={k}
          className={
            'rounded-2xl px-4 py-1.5 text-left text-[clamp(17px,4.2vw,22px)] font-bold shadow-[0_4px_0_#0002] ' +
            (k % 2 ? 'self-end bg-sky-100' : 'self-start bg-white')
          }
        >
          {k === 0 ? '💬' : '↪️'} {l}
        </span>
      ))}
    </button>
  );
}
