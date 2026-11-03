import type { Topic, Word } from '../data';

/** Props chung cho mọi trò chơi một câu. Mỗi câu chỉ được trả lời 1 lần. */
export interface GameProps {
  topic: Topic;
  word: Word;
  /** Bé trả lời xong. `say` = câu đọc lại trước lời khen (khi đúng) */
  onAnswer: (correct: boolean, say?: string | null) => void;
  /** Đã đọc xong câu hỏi: bắt đầu tính giờ */
  onReady: () => void;
  /** Tạm dừng đồng hồ (vd. bé đang nói vào micro) */
  pauseTimer: () => void;
}

export type QuestionType =
  'listen' | 'read' | 'readSentence' | 'spell' | 'sentence' | 'fill' | 'qna' | 'speak' | 'speakSentence';
