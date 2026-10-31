// Giọng đọc (tiếng Anh + tiếng Việt), hiệu ứng âm thanh và lời khen theo tên bé đang chơi
let ctx = null;
let enabled = true;
let voices = { en: null, vi: null };

export const setSoundEnabled = (on) => {
  enabled = on;
  if (!on && 'speechSynthesis' in window) speechSynthesis.cancel();
};

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const all = speechSynthesis.getVoices();
  const norm = (v) => v.lang?.toLowerCase().replace('_', '-') || '';
  voices.vi = all.find((v) => norm(v).startsWith('vi')) || null;
  const en = all.filter((v) => norm(v).startsWith('en-us'));
  voices.en =
    en.find((v) => /samantha|google us english|aria|jenny/i.test(v.name)) || en[0] || all.find((v) => norm(v).startsWith('en')) || null;
}
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

// Đọc một câu. lang: 'en' hoặc 'vi'. Trả Promise xong khi đọc hết.
// Mặc định huỷ câu đang đọc; truyền queue:true để nối tiếp.
export function speak(text, lang = 'en', { rate, pitch = 1.1, queue = false } = {}) {
  return new Promise((resolve) => {
    if (!enabled || !('speechSynthesis' in window) || !text) return resolve();
    if (!queue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'en' ? 'en-US' : 'vi-VN';
    const v = voices[lang];
    if (v) u.voice = v;
    u.rate = rate ?? (lang === 'en' ? 0.8 : 0.95);
    u.pitch = pitch;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    setTimeout(finish, 2000 + text.length * 110);
    speechSynthesis.speak(u);
  });
}

export const stopSpeaking = () => 'speechSynthesis' in window && speechSynthesis.cancel();

function audio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {}
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return enabled ? ctx : null;
}

function tone(freq, start, dur, { type = 'sine', vol = 0.25, to } = {}) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function applause(length = 1.4) {
  const c = audio();
  if (!c) return;
  const sr = c.sampleRate;
  const buf = c.createBuffer(1, Math.floor(sr * length), sr);
  const data = buf.getChannelData(0);
  for (let k = 0; k < length * 70; k++) {
    const pos = Math.floor(Math.random() * (data.length - sr * 0.03));
    const fade = 1 - pos / data.length;
    for (let j = 0; j < sr * 0.02; j++) data[pos + j] += (Math.random() * 2 - 1) * Math.exp(-j / (sr * 0.004)) * fade;
  }
  const src = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const g = c.createGain();
  src.buffer = buf;
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  g.gain.value = 0.35;
  src.connect(filter).connect(g).connect(c.destination);
  src.start();
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Hiệu ứng vui khi đúng, chọn ngẫu nhiên
const FUN_SOUNDS = [
  // xylophone chạy lên
  () => [523, 659, 784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.2, { vol: 0.3 })),
  // còi trượt "vúuut"
  () => tone(400, 0, 0.45, { to: 1800, vol: 0.2 }),
  // lò xo "boing boing"
  () => {
    tone(220, 0, 0.25, { type: 'triangle', to: 880, vol: 0.3 });
    tone(220, 0.25, 0.25, { type: 'triangle', to: 880, vol: 0.3 });
  },
  // kèn "ta-da"
  () => {
    tone(523, 0, 0.12, { type: 'sawtooth', vol: 0.1 });
    tone(784, 0.14, 0.4, { type: 'sawtooth', vol: 0.12 });
  },
  // bong bóng "póc póc póc"
  () => [0, 0.12, 0.24].forEach((s, i) => tone(500 + i * 200, s, 0.1, { to: 1400 + i * 300, vol: 0.3 })),
  // vỗ tay
  () => applause(1.2),
  // xu "ting ting"
  () => {
    tone(988, 0, 0.08, { type: 'square', vol: 0.12 });
    tone(1319, 0.08, 0.35, { type: 'square', vol: 0.12 });
  },
];

// Bé đang chơi: { id, name, short }. App gọi setPlayer khi bé chọn tên.
let player = { id: 'nic', name: 'Nic Sún Răng', short: 'Nic' };
export const setPlayer = (p) => {
  player = p;
};

// {n} = tên đầy đủ, {s} = tên ngắn
const fill = (t) => t.replaceAll('{n}', player.name).replaceAll('{s}', player.short);

// Lời khen hài hước dùng chung cho mọi bé
const PRAISES_COMMON = [
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

// Lời khen riêng theo biệt danh của từng bé
const PRAISES_OWN = {
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

// Lời khen tiếng Anh ngắn, có tên ngắn của bé
const PRAISES_EN = [
  'Great job, {s}!',
  'Super star, {s}!',
  'Wow! Awesome, {s}!',
  'Excellent, {s}!',
  'Well done, {s}!',
  'You are amazing, {s}!',
  'Fantastic, {s}!',
  'Nice work, {s}!',
];

const OOPS_COMMON = [
  'Úi, trượt mất rồi! {n} thử lại nha!',
  'Gần đúng rồi! {n} cố lên chút nữa!',
  'Hì hì, chưa đúng. {n} nhìn kỹ lại nha!',
  'Oops! Không sao, {n} làm lại phát nữa nào!',
];

const OOPS_OWN = {
  nic: ['Ối, gió lùa qua răng sún nên nghe nhầm hả? Nic Sún Răng thử lại nào!'],
  ny: ['Ối, chắc tại trời tối quá nên Ny Đen Đen nhìn nhầm hả? Thử lại nào!'],
};

const DONE_VI = {
  3: ['Ba ngôi sao! {n} là vua tiếng Anh luôn!', 'Tuyệt cú mèo! Ba sao luôn! {n} giỏi nhất quả đất!'],
  2: ['Hai ngôi sao! {n} giỏi lắm, chơi lại để lấy ba sao nào!', 'Hay lắm {n}! Thêm chút nữa là ba sao rồi!'],
  1: ['Một ngôi sao! {n} đã cố gắng rồi, mình luyện thêm nha!', 'Được một sao rồi! Chơi lại nào {n} ơi!'],
};

const DONE_OWN = {
  nic: 'Răng sún cũng phải cúi chào Nic Sún Răng!',
  ny: 'Ny Đen Đen sáng chói nhất hôm nay!',
};

// Khen khi đúng: phát hiệu ứng + trả về câu khen {text, lang}
export function cheer() {
  pick(FUN_SOUNDS)();
  const r = Math.random();
  if (r < 0.25) return { text: fill(pick(PRAISES_EN)), lang: 'en' };
  const own = PRAISES_OWN[player.id] || [];
  const list = r < 0.65 && own.length ? own : PRAISES_COMMON;
  return { text: fill(pick(list)), lang: 'vi' };
}

export function oops() {
  tone(300, 0, 0.18, { type: 'triangle', to: 160, vol: 0.2 });
  return fill(pick([...OOPS_COMMON, ...(OOPS_OWN[player.id] || [])]));
}

// Tiếng "bụp" nhẹ khi chạm sai trong lúc ghép chữ (không đọc)
export function buzz() {
  tone(200, 0, 0.12, { type: 'square', vol: 0.08 });
}

export function pop() {
  tone(600, 0, 0.1, { to: 1200, vol: 0.2 });
}

export function finish(stars) {
  applause(2);
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, { type: 'triangle', vol: 0.25 }));
  const text = fill(pick(DONE_VI[stars] || DONE_VI[1]));
  return stars === 3 && DONE_OWN[player.id] ? `${text} ${DONE_OWN[player.id]}` : text;
}

// Nhận diện giọng nói tiếng Anh (Chrome, Edge, Safari). Trả null nếu máy không hỗ trợ.
export function listenEn() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  return new Promise((resolve) => {
    const rec = new SR();
    rec.lang = 'en-US';
    rec.maxAlternatives = 5;
    rec.interimResults = false;
    let heard = [];
    rec.onresult = (e) => {
      heard = Array.from(e.results[0]).map((r) => r.transcript);
    };
    rec.onerror = (e) => resolve({ heard: [], error: e.error });
    rec.onend = () => resolve({ heard });
    stopSpeaking();
    rec.start();
    setTimeout(() => rec.stop(), 5000);
  });
}

export const canListen = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
