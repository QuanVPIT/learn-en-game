import { GRADE1 } from './grade1';
import { GRADE2 } from './grade2';
import { GRADE3 } from './grade3';
import { GRADE4 } from './grade4';
import { GRADE5 } from './grade5';
import type { Grade, Topic } from './types';

export * from './types';
export { ACTIVITIES } from './activities';
export { PLAYERS } from './players';

export const TOPICS: Topic[] = [...GRADE1, ...GRADE2, ...GRADE3, ...GRADE4, ...GRADE5];

export const GRADES: { id: Grade; label: string; note: string }[] = [
  { id: 1, label: 'Lớp 1', note: 'Ôn lại' },
  { id: 2, label: 'Lớp 2', note: 'Tiếng Anh 2' },
  { id: 3, label: 'Lớp 3', note: 'Tiếng Anh 3' },
  { id: 4, label: 'Lớp 4', note: 'Tiếng Anh 4' },
  { id: 5, label: 'Lớp 5', note: 'Tiếng Anh 5' },
];
