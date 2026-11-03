import { describe, expect, it } from 'vitest';
import { emptyProgress, migrate, nextStreak, recordAnswer, recordSession, starsFor } from './progress';

describe('tiến độ', () => {
  it('chấm sao theo số câu đúng', () => {
    expect([8, 7, 6, 5, 4, 1, 0].map((c) => starsFor(c, 8))).toEqual([3, 3, 2, 2, 1, 1, 0]);
  });

  it('sổ ôn tập: sai thì thêm, đúng 2 lần thì thuộc', () => {
    let p = recordAnswer(emptyProgress(), 'zoo', 'lion', false);
    expect(p.review['zoo|lion']).toMatchObject({ wrong: 1, need: 2 });
    p = recordAnswer(p, 'zoo', 'lion', true);
    expect(p.review['zoo|lion'].need).toBe(1);
    p = recordAnswer(p, 'zoo', 'lion', false);
    expect(p.review['zoo|lion']).toMatchObject({ wrong: 2, need: 2 });
    p = recordAnswer(recordAnswer(p, 'zoo', 'lion', true), 'zoo', 'lion', true);
    expect(p.review['zoo|lion']).toBeUndefined();
    expect(p.reviewDone).toBe(1);
    // Từ chưa từng sai thì trả lời đúng không thêm vào sổ
    expect(recordAnswer(emptyProgress(), 'zoo', 'bear', true).review).toEqual({});
  });

  it('chuỗi ngày học', () => {
    const d = (s: string) => new Date(s + 'T10:00:00');
    let s = nextStreak({ last: '', count: 0 }, d('2026-11-01'));
    expect(s).toEqual({ last: '2026-11-01', count: 1 });
    expect(nextStreak(s, d('2026-11-01'))).toBe(s);
    s = nextStreak(s, d('2026-11-02'));
    expect(s.count).toBe(2);
    expect(nextStreak(s, d('2026-11-05')).count).toBe(1);
  });

  it('lượt chơi: lưu sao cao nhất, lịch sử và huy hiệu', () => {
    const base = { topicId: 'zoo', activity: 'listen' as const, total: 8, level: 'easy' as const };
    let r = recordSession(emptyProgress(), { ...base, correct: 8 }, { saveStars: true });
    expect(r.progress.stars.zoo.listen).toBe(3);
    expect(r.newBadges).toEqual(expect.arrayContaining(['first', 'perfect']));
    r = recordSession(r.progress, { ...base, correct: 2 }, { saveStars: true });
    expect(r.progress.stars.zoo.listen).toBe(3);
    expect(r.newBadges).toEqual([]);
    expect(r.progress.history).toHaveLength(2);
    // Làm lại câu sai thì không tính sao
    r = recordSession(emptyProgress(), { ...base, correct: 8 }, { saveStars: false });
    expect(r.progress.stars).toEqual({});
  });

  it('chuyển dữ liệu sao cũ', () => {
    const all = migrate({ nic: { zoo: { listen: 2 } } }, null);
    expect(all.nic.stars.zoo.listen).toBe(2);
    expect(all.nic.review).toEqual({});
  });
});
