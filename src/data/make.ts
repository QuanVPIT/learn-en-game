import type { Grade, Topic, Word } from './types';

/** [tiếng Anh, nghĩa, hình, cụm dùng trong câu?] */
export type RawWord = [en: string, vi: string, pic: string, np?: string];

export const article = (en: string) => (/^[aeiou]/i.test(en) ? 'an ' : 'a ') + en;
export const capFirst = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

interface TopicInput {
  id: string;
  grade: Grade;
  icon: string;
  title: string;
  vi: string;
  color: string;
  sentence: (w: Word) => string;
  ask?: Topic['ask'];
  words: RawWord[];
}

export function topic({ words, ...rest }: TopicInput): Topic {
  return { ...rest, words: words.map(([en, vi, pic, np]) => ({ en, vi, pic, np: np ?? article(en) })) };
}
