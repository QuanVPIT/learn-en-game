// Lời khen / động viên theo bé đang chơi, kèm hiệu ứng âm thanh
import {
  DONE,
  DONE_OWN,
  OOPS_COMMON,
  OOPS_OWN,
  PRAISES_COMMON,
  PRAISES_EN,
  PRAISES_OWN,
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

export function oops(p: Player): string {
  sfx.oops();
  return fillName(pick([...OOPS_COMMON, ...(OOPS_OWN[p.id] ?? [])]), p);
}

/** Lời khen cuối lượt (có thể 2 câu) */
export function finishLines(p: Player, stars: 1 | 2 | 3): string[] {
  sfx.finish();
  const lines = [fillName(pick(DONE[stars]), p)];
  if (stars === 3 && DONE_OWN[p.id]) lines.push(DONE_OWN[p.id]);
  return lines;
}
