// Số sao: theo bé → chủ đề → trò chơi
import type { ActivityId } from '../data';

export type TopicStars = Partial<Record<ActivityId, number>>;
export type PlayerStars = Record<string, TopicStars>;
export type AllStars = Record<string, PlayerStars>;

export const sumStars = (t: TopicStars = {}) => Object.values(t).reduce((a, b) => a + (b ?? 0), 0);

export function addStars(all: AllStars, playerId: string, topicId: string, activity: ActivityId, n: number): AllStars {
  const mine = { ...(all[playerId] ?? {}) };
  const t = { ...(mine[topicId] ?? {}) };
  t[activity] = Math.max(t[activity] ?? 0, n);
  mine[topicId] = t;
  return { ...all, [playerId]: mine };
}
