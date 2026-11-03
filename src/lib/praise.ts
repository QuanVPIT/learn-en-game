// Lời khen / động viên theo bé đang chơi, kèm hiệu ứng âm thanh
import {
  DONE,
  DONE_OWN,
  PRAISES_COMMON,
  PRAISES_EN,
  PRAISES_OWN,
  TEASE_COMMON,
  TEASE_OWN,
  TIMEOUT_TEASE,
  fillName,
} from '../data/phrases';
import type { Lang, Player } from '../data/types';
import { pick } from './random';
import { sfx } from './sfx';

export function cheer(p: Player): { text: string; lang: Lang } {
  sfx.fun();
  const r = Math.random();
  if (r < 0.25) return { text: fillName(pick(PRAISES_EN), p), lang: 'en' };
  const own = PRAISES_OWN[p.id] ?? [];
  return { text: fillName(pick(r < 0.65 && own.length ? own : PRAISES_COMMON), p), lang: 'vi' };
}

/** Chê ngộ nghĩnh khi sai (kèm tiếng "oa oa oa") hoặc hết giờ */
export function tease(p: Player, timeout = false): string {
  if (timeout) {
    sfx.timeout();
    return fillName(pick(TIMEOUT_TEASE), p);
  }
  sfx.wrong();
  const own = TEASE_OWN[p.id] ?? [];
  return fillName(pick(Math.random() < 0.35 && own.length ? own : TEASE_COMMON), p);
}

/** Lời khen cuối lượt (có thể 2 câu) */
export function finishLines(p: Player, stars: 0 | 1 | 2 | 3): string[] {
  sfx.finish();
  const lines = [fillName(pick(DONE[Math.max(1, stars) as 1 | 2 | 3]), p)];
  if (stars === 3 && DONE_OWN[p.id]) lines.push(DONE_OWN[p.id]);
  return lines;
}
