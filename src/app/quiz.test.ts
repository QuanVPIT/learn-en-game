import { describe, expect, it } from 'vitest';
import { ACTIVITIES, TOPICS } from '../data';
import { activitiesFor, fillBlank } from '../data/lessons';
import { emptyProgress, recordAnswer } from './progress';
import { QUESTIONS, buildQueue, buildReviewQueue, promptOf, secondsFor } from './quiz';

describe('bộ câu hỏi', () => {
  it('mỗi trò của mỗi chủ đề có đủ 8 câu đúng kiểu', () => {
    for (const t of TOPICS) {
      for (const a of activitiesFor(t).filter((x) => x.id !== 'learn')) {
        const q = buildQueue(t, a);
        expect(q).toHaveLength(QUESTIONS);
        if (a.id === 'fill') q.forEach((x) => expect(fillBlank(t, x.word)).not.toBeNull());
      }
    }
  });

  it('ưu tiên từ bé hay sai', () => {
    const t = TOPICS.find((x) => x.id === 'zoo')!;
    const p = recordAnswer(emptyProgress(), 'zoo', 'snake', false);
    const listen = ACTIVITIES.find((a) => a.id === 'listen')!;
    expect(buildQueue(t, listen, p).some((q) => q.word.en === 'snake')).toBe(true);
  });

  it('sổ ôn tập lấy từ hay sai ở mọi chủ đề', () => {
    let p = recordAnswer(emptyProgress(), 'zoo', 'snake', false);
    p = recordAnswer(p, 'g5health', 'fever', false);
    const items = buildReviewQueue(p);
    expect(items.map((i) => i.word.en).sort()).toEqual(['fever', 'snake']);
  });

  it('thời gian: trò ghép / xếp / nói gấp 3', () => {
    expect(secondsFor('listen', 'easy')).toBe(9);
    expect(secondsFor('read', 'hard')).toBe(3);
    expect(secondsFor('spell', 'medium')).toBe(18);
    expect(secondsFor('speakSentence', 'hard')).toBe(9);
  });

  it('báo câu sai không lộ đáp án của trò chọn hình / điền từ', () => {
    for (const t of TOPICS) {
      for (const w of t.words) {
        expect(promptOf({ topic: t, word: w, type: 'listen' }).text).not.toContain(w.en);
        const b = fillBlank(t, w);
        if (b) expect(promptOf({ topic: t, word: w, type: 'fill' }).text).toContain('____');
      }
    }
  });
});
