export type LevelId = 'easy' | 'medium' | 'hard';

/** Độ khó: số giây cho mỗi câu chọn đáp án (trò ghép / xếp / nói được gấp 3) */
export const LEVELS: { id: LevelId; label: string; seconds: number; icon: string }[] = [
  { id: 'easy', label: 'Dễ', seconds: 9, icon: '🐢' },
  { id: 'medium', label: 'Trung bình', seconds: 6, icon: '🐇' },
  { id: 'hard', label: 'Khó', seconds: 3, icon: '🚀' },
];

export const levelOf = (id: LevelId) => LEVELS.find((l) => l.id === id) ?? LEVELS[0];
