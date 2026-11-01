// Hiệu ứng âm thanh tự tạo bằng Web Audio (không cần file)
import { pick } from './random';
import { isSoundOn } from './soundSwitch';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!ctx) {
    try {
      const AC =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return isSoundOn() ? ctx : null;
}

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  to?: number;
}

function tone(freq: number, start: number, dur: number, { type = 'sine', vol = 0.25, to }: ToneOpts = {}) {
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

// Hiệu ứng vui khi đúng, chọn ngẫu nhiên
const FUN_SOUNDS = [
  () => [523, 659, 784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.2, { vol: 0.3 })), // xylophone
  () => tone(400, 0, 0.45, { to: 1800, vol: 0.2 }), // còi "vúuut"
  () => {
    tone(220, 0, 0.25, { type: 'triangle', to: 880, vol: 0.3 }); // lò xo "boing boing"
    tone(220, 0.25, 0.25, { type: 'triangle', to: 880, vol: 0.3 });
  },
  () => {
    tone(523, 0, 0.12, { type: 'sawtooth', vol: 0.1 }); // kèn "ta-da"
    tone(784, 0.14, 0.4, { type: 'sawtooth', vol: 0.12 });
  },
  () => [0, 0.12, 0.24].forEach((s, i) => tone(500 + i * 200, s, 0.1, { to: 1400 + i * 300, vol: 0.3 })), // bong bóng
  () => applause(1.2),
  () => {
    tone(988, 0, 0.08, { type: 'square', vol: 0.12 }); // xu "ting ting"
    tone(1319, 0.08, 0.35, { type: 'square', vol: 0.12 });
  },
];

export const sfx = {
  fun: () => pick(FUN_SOUNDS)(),
  oops: () => tone(300, 0, 0.18, { type: 'triangle', to: 160, vol: 0.2 }),
  buzz: () => tone(200, 0, 0.12, { type: 'square', vol: 0.08 }),
  pop: () => tone(600, 0, 0.1, { to: 1200, vol: 0.2 }),
  beep: () => tone(880, 0, 0.12, { vol: 0.2 }),
  finish: () => {
    applause(2);
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, { type: 'triangle', vol: 0.25 }));
  },
};
