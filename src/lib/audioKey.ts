import type { Lang } from '../data/types';

// Tên file mp3 cho một câu: ngôn ngữ + mã băm của nội dung (dùng chung cho app và script tạo giọng)
function hash(text: string, seed: number, mul: number) {
  let h = seed >>> 0;
  for (const ch of text) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, mul) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function audioKey(lang: Lang, text: string) {
  const t = text.trim().replace(/\s+/g, ' ');
  return `${lang}-${hash(t, 0x811c9dc5, 0x01000193)}${hash(t, 0x9747b28c, 0x5bd1e995)}`;
}
