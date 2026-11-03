// Huy hiệu: điều kiện được tính từ tiến độ của bé
import { TOPICS } from './index';
import type { Grade } from './types';

export interface BadgeStats {
  sessions: number;
  perfect: number;
  streak: number;
  totalStars: number;
  reviewDone: number;
  /** Số chủ đề đã có sao, theo lớp */
  topicsWithStars: (grade: Grade) => number;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  earned: (s: BadgeStats) => boolean;
}

const gradeCount = (g: Grade) => TOPICS.filter((t) => t.grade === g).length;

export const BADGES: Badge[] = [
  { id: 'first', icon: '🎉', name: 'Khởi đầu', desc: 'Chơi xong lượt đầu tiên', earned: (s) => s.sessions >= 1 },
  { id: 'perfect', icon: '💯', name: 'Tuyệt đối', desc: 'Đúng hết một lượt', earned: (s) => s.perfect >= 1 },
  { id: 'perfect10', icon: '👑', name: 'Vua tuyệt đối', desc: '10 lượt đúng hết', earned: (s) => s.perfect >= 10 },
  { id: 'streak3', icon: '🔥', name: 'Chăm chỉ', desc: 'Học 3 ngày liên tiếp', earned: (s) => s.streak >= 3 },
  { id: 'streak7', icon: '🌋', name: 'Siêu chăm', desc: 'Học 7 ngày liên tiếp', earned: (s) => s.streak >= 7 },
  { id: 'stars20', icon: '⭐', name: 'Ngôi sao nhỏ', desc: 'Có 20 sao', earned: (s) => s.totalStars >= 20 },
  { id: 'stars100', icon: '🌟', name: 'Ngôi sao lớn', desc: 'Có 100 sao', earned: (s) => s.totalStars >= 100 },
  {
    id: 'review10',
    icon: '📒',
    name: 'Sửa sai giỏi',
    desc: 'Ôn thuộc 10 câu trong Sổ ôn tập',
    earned: (s) => s.reviewDone >= 10,
  },
  ...([1, 2, 3, 4, 5] as Grade[]).map((g) => ({
    id: `grade${g}`,
    icon: '🎓',
    name: `Xong lớp ${g}`,
    desc: `Có sao ở mọi chủ đề lớp ${g}`,
    earned: (s: BadgeStats) => s.topicsWithStars(g) >= gradeCount(g),
  })),
];
