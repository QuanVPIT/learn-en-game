import { describe, expect, it } from 'vitest';
import { GRADES, TOPICS } from './index';
import { activitiesFor, answerOptions, blankOptions, dialog, fillBlank, pictureOptions } from './lessons';
import { allPhrases } from './phrases';
import { audioKey } from '../lib/audioKey';

describe('dữ liệu bài học', () => {
  it('lớp nào cũng có chủ đề', () => {
    for (const g of GRADES) expect(TOPICS.filter((t) => t.grade === g.id).length).toBeGreaterThan(3);
  });

  it('mã chủ đề không trùng', () => {
    const ids = TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const t of TOPICS) {
    describe(t.id, () => {
      it('có ít nhất 5 từ, không trùng từ, không trùng hình', () => {
        expect(t.words.length).toBeGreaterThanOrEqual(5);
        expect(new Set(t.words.map((w) => w.en)).size).toBe(t.words.length);
        expect(new Set(t.words.map((w) => w.pic)).size).toBe(t.words.length);
      });

      it('câu mẫu đầy đủ, viết hoa đầu câu và có dấu câu', () => {
        for (const w of t.words) {
          const d = dialog(t, w);
          for (const line of [d.q, d.a].filter(Boolean) as string[]) {
            expect(line).toMatch(/^[A-Z]/);
            expect(line).toMatch(/[.?!]$/);
            expect(line).not.toMatch(/undefined|\s{2}/);
          }
        }
      });

      it('mỗi câu hỏi có đủ lựa chọn hình', () => {
        for (const w of t.words) expect(pictureOptions(t, w, 4)).toHaveLength(4);
      });

      it('trò Điền từ có chỗ trống và lựa chọn khác nhau', () => {
        if (!activitiesFor(t).some((a) => a.id === 'fill')) return;
        for (const w of t.words) {
          const b = fillBlank(t, w);
          if (!b) continue;
          expect(b.before + b.answer + b.after).toBe(b.full);
          const opts = blankOptions(t, w, 4);
          expect(opts).toContain(b.answer);
          expect(new Set(opts).size).toBe(opts.length);
          expect(opts.length).toBeGreaterThanOrEqual(3);
        }
      });

      it('trò Hỏi – Đáp có đáp án đúng và 2 câu nhiễu', () => {
        if (!activitiesFor(t).some((a) => a.id === 'qna')) return;
        for (const w of t.words) {
          const opts = answerOptions(TOPICS, t, w, 3);
          expect(opts).toContain(dialog(t, w).a);
          expect(opts).toHaveLength(3);
        }
      });
    });
  }
});

describe('giọng đọc', () => {
  it('mỗi câu có tên file riêng (không trùng mã)', () => {
    const phrases = allPhrases();
    const keys = new Set(phrases.map((p) => audioKey(p.lang, p.text)));
    expect(keys.size).toBe(phrases.length);
  });

  it('tên file cố định với cùng nội dung', () => {
    expect(audioKey('en', 'Hello  Mai!')).toBe(audioKey('en', ' Hello Mai! '));
    expect(audioKey('en', 'cat')).not.toBe(audioKey('vi', 'cat'));
  });
});
