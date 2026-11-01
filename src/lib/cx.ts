/** Ghép các class Tailwind, bỏ giá trị rỗng */
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
