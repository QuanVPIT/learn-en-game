// Tiến độ của từng bé: sao, sổ ôn tập, lịch sử chơi, chuỗi ngày học, huy hiệu.
// Toàn bộ là hàm thuần (không đụng tới localStorage) để dễ kiểm thử.
import { TOPICS, type ActivityId, type Grade } from '../data';
import { BADGES, type BadgeStats } from '../data/badges';
import type { LevelId } from '../data/levels';

export type TopicStars = Partial<Record<ActivityId, number>>;
export type PlayerStars = Record<string, TopicStars>;

/** Một từ hay sai trong sổ ôn tập. `need` = số lần cần đúng nữa để coi là đã thuộc */
export interface ReviewEntry {
  topicId: string;
  en: string;
  wrong: number;
  need: number;
}

export interface SessionLog {
  at: string;
  topicId: string;
  activity: ActivityId | 'review';
  correct: number;
  total: number;
  level: LevelId;
}

export interface PlayerProgress {
  stars: PlayerStars;
  review: Record<string, ReviewEntry>;
  reviewDone: number;
  history: SessionLog[];
  sessions: number;
  perfect: number;
  streak: { last: string; count: number };
  badges: string[];
}

export type AllProgress = Record<string, PlayerProgress>;

export const emptyProgress = (): PlayerProgress => ({
  stars: {},
  review: {},
  reviewDone: 0,
  history: [],
  sessions: 0,
  perfect: 0,
  streak: { last: '', count: 0 },
  badges: [],
});

export const sumStars = (t: TopicStars = {}) => Object.values(t).reduce((a, b) => a + (b ?? 0), 0);
export const totalStars = (p: PlayerProgress) => Object.values(p.stars).reduce((n, t) => n + sumStars(t), 0);

/** Số sao theo số câu đúng (8 câu: 7–8 → 3, 5–6 → 2, 1–4 → 1) */
export function starsFor(correct: number, total: number): 0 | 1 | 2 | 3 {
  const r = total ? correct / total : 0;
  if (r >= 0.85) return 3;
  if (r >= 0.6) return 2;
  if (r > 0) return 1;
  return 0;
}

export const reviewKey = (topicId: string, en: string) => `${topicId}|${en}`;

/** Ghi nhận một câu trả lời vào sổ ôn tập */
export function recordAnswer(p: PlayerProgress, topicId: string, en: string, correct: boolean): PlayerProgress {
  const key = reviewKey(topicId, en);
  const review = { ...p.review };
  let reviewDone = p.reviewDone;
  const cur = review[key];
  if (!correct) {
    review[key] = { topicId, en, wrong: (cur?.wrong ?? 0) + 1, need: 2 };
  } else if (cur) {
    if (cur.need <= 1) {
      delete review[key];
      reviewDone++;
    } else review[key] = { ...cur, need: cur.need - 1 };
  }
  return { ...p, review, reviewDone };
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Cập nhật chuỗi ngày học liên tiếp */
export function nextStreak(streak: PlayerProgress['streak'], now: Date): PlayerProgress['streak'] {
  const today = dayKey(now);
  if (streak.last === today) return streak;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return { last: today, count: streak.last === dayKey(y) ? streak.count + 1 : 1 };
}

export function badgeStats(p: PlayerProgress): BadgeStats {
  return {
    sessions: p.sessions,
    perfect: p.perfect,
    streak: p.streak.count,
    totalStars: totalStars(p),
    reviewDone: p.reviewDone,
    topicsWithStars: (g: Grade) => TOPICS.filter((t) => t.grade === g && sumStars(p.stars[t.id]) > 0).length,
  };
}

/** Ghi nhận một lượt chơi xong. Trả về tiến độ mới và các huy hiệu vừa đạt. */
export function recordSession(
  p: PlayerProgress,
  log: Omit<SessionLog, 'at'>,
  opts: { saveStars: boolean; now?: Date },
): { progress: PlayerProgress; newBadges: string[] } {
  const now = opts.now ?? new Date();
  const stars = { ...p.stars };
  if (opts.saveStars && log.activity !== 'review') {
    const t = { ...(stars[log.topicId] ?? {}) };
    const s = starsFor(log.correct, log.total);
    t[log.activity] = Math.max(t[log.activity] ?? 0, s);
    stars[log.topicId] = t;
  }
  const next: PlayerProgress = {
    ...p,
    stars,
    history: [{ ...log, at: now.toISOString() }, ...p.history].slice(0, 100),
    sessions: p.sessions + 1,
    perfect: p.perfect + (log.total > 0 && log.correct === log.total ? 1 : 0),
    streak: nextStreak(p.streak, now),
  };
  const stats = badgeStats(next);
  const newBadges = BADGES.filter((b) => !next.badges.includes(b.id) && b.earned(stats)).map((b) => b.id);
  next.badges = [...next.badges, ...newBadges];
  return { progress: next, newBadges };
}

/** Chuyển số sao kiểu cũ (phiên bản trước) sang tiến độ mới */
export function migrate(oldStars: Record<string, PlayerStars> | null, saved: AllProgress | null): AllProgress {
  if (saved) return saved;
  const out: AllProgress = {};
  for (const [id, stars] of Object.entries(oldStars ?? {})) out[id] = { ...emptyProgress(), stars };
  return out;
}
