export type Lang = 'en' | 'vi';
export type Grade = 1 | 2 | 3 | 4 | 5;

/** Một từ / cụm từ. `pic` là emoji, chữ số, hoặc mã màu "#rrggbb". `np` là phần dùng để ghép câu. */
export interface Word {
  en: string;
  vi: string;
  pic: string;
  np: string;
}

/** Một chủ đề (thường ứng với một Unit trong sách) */
export interface Topic {
  id: string;
  grade: Grade;
  icon: string;
  title: string;
  vi: string;
  color: string;
  /** Câu mẫu chứa từ */
  sentence: (w: Word) => string;
  /** Câu hỏi (hoặc câu đáp nếu `sentence` là câu hỏi) đi kèm câu mẫu */
  ask?: string | ((w: Word) => string);
  words: Word[];
}

export type ActivityId =
  'learn' | 'listen' | 'read' | 'spell' | 'sentence' | 'fill' | 'qna' | 'speak' | 'speakSentence' | 'challenge';

export interface Activity {
  id: ActivityId;
  icon: string;
  title: string;
  skill: string;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  short: string;
  face: string;
  color: string;
  shadow: string;
}
