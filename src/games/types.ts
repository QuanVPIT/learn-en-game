import type { Topic, Word } from '../data';

/** Props chung cho mọi trò chơi một câu */
export interface GameProps {
  topic: Topic;
  word: Word;
  /** Bé làm đúng. `say` = câu đọc lại trước lời khen (nếu có) */
  onRight: (say?: string | null) => void;
  /** Bé làm sai. `quiet` = chỉ kêu "bụp", không đọc lời động viên */
  onWrong: (quiet?: boolean) => void;
}

export type QuestionType =
  'listen' | 'read' | 'readSentence' | 'spell' | 'sentence' | 'fill' | 'qna' | 'speak' | 'speakSentence';
