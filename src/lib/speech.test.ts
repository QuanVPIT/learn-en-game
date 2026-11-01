import { describe, expect, it } from 'vitest';
import { norm, passScore, scoreSpeech } from './speech';

const pass = (heard: string[], target: string) => scoreSpeech(heard, target).score >= passScore(target);

describe('chấm phát âm', () => {
  it('chuẩn hoá chữ, số và dấu', () => {
    expect(norm("It's 7, OK?")).toBe('its seven ok');
  });

  it('nói đúng thì qua', () => {
    expect(pass(['elephant'], 'elephant')).toBe(true);
    expect(pass(['I like swimming'], 'I like swimming.')).toBe(true);
    expect(pass(['would you like some rice'], 'Would you like some rice?')).toBe(true);
  });

  it('dễ tính với trẻ: gần đúng, đồng âm, dính liền, thiếu đuôi', () => {
    expect(pass(['elefant'], 'elephant')).toBe(true);
    expect(pass(['to'], 'two')).toBe(true);
    expect(pass(['7'], 'seven')).toBe(true);
    expect(pass(['icecream'], 'ice cream')).toBe(true);
    expect(pass(['I like swim'], 'I like swimming.')).toBe(true);
    expect(pass(['good morning my'], 'Good morning, Mai!')).toBe(true);
  });

  it('nói sai thì không qua', () => {
    expect(pass(['dog'], 'cat')).toBe(false);
    expect(pass(['and if and'], 'elephant')).toBe(false);
    expect(pass(['like'], 'I like swimming.')).toBe(false);
    expect(pass([], 'cat')).toBe(false);
  });

  it('chọn cách nghe tốt nhất trong các phương án', () => {
    expect(pass(['cap', 'cut', 'cat'], 'cat')).toBe(true);
  });

  it('đánh dấu từng từ đúng / sai', () => {
    const r = scoreSpeech(['I like singing'], 'I like swimming.');
    expect(r.words.map((w) => w.ok)).toEqual([true, true, false]);
  });
});
