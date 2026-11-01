// Mọi câu máy nói (ngoài từ vựng). Script tạo giọng AI cũng đọc danh sách này.
import { TOPICS } from './index';
import { PLAYERS } from './players';
import { dialog } from './lessons';
import type { Lang, Player } from './types';

/** {n} = tên đầy đủ, {s} = tên ngắn */
export const fillName = (t: string, p: Player) => t.replaceAll('{n}', p.name).replaceAll('{s}', p.short);

export const PRAISES_COMMON = [
  'Ối giời ơi! {n} thông minh hơn cả cô giáo luôn!',
  'Vèo vèo! {n} làm nhanh như tên lửa!',
  'Bố ơi mẹ ơi, {n} sắp thành giáo viên tiếng Anh rồi!',
  'Chuẩn không cần chỉnh! {n} number one!',
  'Ha ha! {n} đúng rồi! Cả nhà vỗ tay bép bép!',
  'Đỉnh của chóp! {n} giỏi quá trời quá đất!',
  'Chú chuột nhắt đang nhảy múa ăn mừng cho {n} đấy!',
  'Úi chà chà! {n} giỏi thế này thì con mèo nhà bên cũng phải học theo!',
  'Tèn ten! {n} lại đúng nữa rồi, máy tính sắp hết lời khen luôn!',
];

export const PRAISES_OWN: Record<string, string[]> = {
  nic: [
    'Nic Sún Răng giỏi quá, cười một cái lộ cả răng sún luôn!',
    'Răng sún mà nói tiếng Anh chuẩn như người Mỹ! Nic Sún Răng ơi!',
    'Thưởng Nic Sún Răng một cái kẹo! À quên, sún răng rồi, thưởng cái ôm nhé!',
    'Nic Sún Răng siêu như siêu nhân, chỉ thiếu mỗi cái răng cửa thôi!',
    'Giỏi thế này thì bà tiên răng phải mang quà cho Nic Sún Răng rồi!',
    'Úi chà! Gió lùa qua răng sún cũng không cản được Nic Sún Răng!',
    'Răng mới mọc ra cũng phải ngoi lên khen Nic Sún Răng đấy!',
  ],
  ny: [
    'Ny Đen Đen giỏi quá! Đen đen mà sáng chói như ngôi sao luôn!',
    'Ai bảo đen đủi? Ny Đen Đen may mắn và giỏi nhất nhà!',
    'Sô cô la đen cũng không ngọt bằng Ny Đen Đen!',
    'Cả nhà phải đeo kính râm vì Ny Đen Đen tỏa sáng quá!',
    'Ny Đen Đen đúng rồi! Đen nhưng mà giỏi, giỏi ơi là giỏi!',
    'Hạt nhãn đen láy cũng phải ghen tị với Ny Đen Đen thông minh!',
    'Ny Đen Đen ơi, giỏi thế này thì mặt trời cũng phải xin chữ ký!',
  ],
};

export const PRAISES_EN = [
  'Great job, {s}!',
  'Super star, {s}!',
  'Wow! Awesome, {s}!',
  'Excellent, {s}!',
  'Well done, {s}!',
  'You are amazing, {s}!',
  'Fantastic, {s}!',
  'Nice work, {s}!',
];

export const OOPS_COMMON = [
  'Úi, trượt mất rồi! {n} thử lại nha!',
  'Gần đúng rồi! {n} cố lên chút nữa!',
  'Hì hì, chưa đúng. {n} nhìn kỹ lại nha!',
  'Oops! Không sao, {n} làm lại phát nữa nào!',
];

export const OOPS_OWN: Record<string, string[]> = {
  nic: ['Ối, gió lùa qua răng sún nên nghe nhầm hả? Nic Sún Răng thử lại nào!'],
  ny: ['Ối, chắc tại trời tối quá nên Ny Đen Đen nhìn nhầm hả? Thử lại nào!'],
};

export const DONE: Record<1 | 2 | 3, string[]> = {
  3: ['Ba ngôi sao! {n} là vua tiếng Anh luôn!', 'Tuyệt cú mèo! Ba sao luôn! {n} giỏi nhất quả đất!'],
  2: ['Hai ngôi sao! {n} giỏi lắm, chơi lại để lấy ba sao nào!', 'Hay lắm {n}! Thêm chút nữa là ba sao rồi!'],
  1: ['Một ngôi sao! {n} đã cố gắng rồi, mình luyện thêm nha!', 'Được một sao rồi! Chơi lại nào {n} ơi!'],
};

export const DONE_OWN: Record<string, string> = {
  nic: 'Răng sún cũng phải cúi chào Nic Sún Răng!',
  ny: 'Ny Đen Đen sáng chói nhất hôm nay!',
};

/** Các câu dẫn dắt */
export const PROMPTS = {
  welcome: 'Xin chào các bé! Bé nào đang chơi đây nhỉ?',
  hello: (p: Player) => `Xin chào ${p.name}!`,
  helloEn: (p: Player) => `Hello ${p.short}! Let's learn English!`,
  chooseTopic: (p: Player) => `${p.name} muốn học chủ đề nào?`,
  almost: (p: Player) => `Gần đúng rồi! ${p.name} nói lại nha!`,
  listenAgain: (p: Player) => `${p.name} nghe mẫu rồi nói lại nha!`,
};

/** Toàn bộ câu cần giọng đọc (để tạo file mp3) */
export function allPhrases(): { lang: Lang; text: string }[] {
  const out: { lang: Lang; text: string }[] = [];
  const add = (lang: Lang, text: string) => out.push({ lang, text });

  add('vi', PROMPTS.welcome);
  for (const p of PLAYERS) {
    add('vi', PROMPTS.hello(p));
    add('en', PROMPTS.helloEn(p));
    add('vi', PROMPTS.chooseTopic(p));
    add('vi', PROMPTS.almost(p));
    add('vi', PROMPTS.listenAgain(p));
    [...PRAISES_COMMON, ...(PRAISES_OWN[p.id] ?? []), ...OOPS_COMMON, ...(OOPS_OWN[p.id] ?? [])].forEach((t) =>
      add('vi', fillName(t, p)),
    );
    PRAISES_EN.forEach((t) => add('en', fillName(t, p)));
    Object.values(DONE)
      .flat()
      .forEach((t) => add('vi', fillName(t, p)));
    if (DONE_OWN[p.id]) add('vi', DONE_OWN[p.id]);
  }

  for (const t of TOPICS) {
    add('en', t.title);
    for (const w of t.words) {
      add('en', w.en);
      add('vi', w.vi);
      const d = dialog(t, w);
      if (d.q) add('en', d.q);
      add('en', d.a);
    }
  }

  // Bỏ trùng
  const seen = new Set<string>();
  return out.filter(({ lang, text }) => {
    const k = lang + '|' + text;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
