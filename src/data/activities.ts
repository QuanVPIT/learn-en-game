import type { Activity } from './types';

/** Các trò chơi, đủ 4 kỹ năng nghe – nói – đọc – viết */
export const ACTIVITIES: Activity[] = [
  { id: 'learn', icon: '📚', title: 'Học từ', skill: 'Làm quen', color: '#ffd166' },
  { id: 'listen', icon: '🎧', title: 'Nghe chọn hình', skill: 'Nghe', color: '#7bdff2' },
  { id: 'read', icon: '📖', title: 'Đọc chọn hình', skill: 'Đọc', color: '#b8f2a6' },
  { id: 'spell', icon: '✏️', title: 'Ghép chữ', skill: 'Viết', color: '#ffb4a2' },
  { id: 'sentence', icon: '🧩', title: 'Xếp câu', skill: 'Câu', color: '#b8a1ff' },
  { id: 'fill', icon: '✍️', title: 'Điền từ', skill: 'Đọc – Viết', color: '#a0e7e5' },
  { id: 'qna', icon: '💬', title: 'Hỏi – Đáp', skill: 'Nghe – Đọc', color: '#ffc6ff' },
  { id: 'speak', icon: '🎤', title: 'Nói từ', skill: 'Nói', color: '#ff8fab' },
  { id: 'speakSentence', icon: '🗣️', title: 'Nói câu', skill: 'Nói', color: '#ffa8d4' },
  { id: 'challenge', icon: '🏆', title: 'Thử thách', skill: 'Tổng hợp', color: '#ffc75f' },
];
