// Giọng đọc: ưu tiên file mp3 giọng AI tạo sẵn (public/audio, xem scripts/gen-audio.ts);
// câu nào chưa có file thì dùng giọng có sẵn của trình duyệt.
import type { Lang } from '../data/types';
import { audioKey } from './audioKey';
import { isSoundOn, onSoundChange } from './soundSwitch';

export interface SpeakOpts {
  /** Đọc chậm (nghe mẫu chậm) */
  slow?: boolean;
  /** Nối tiếp sau câu đang đọc thay vì cắt ngang */
  queue?: boolean;
}

const BASE = `${import.meta.env.BASE_URL}audio/`;
let manifest: Set<string> | null = null;

/** Tải danh sách file giọng đọc có sẵn */
export async function loadVoiceManifest() {
  try {
    const res = await fetch(`${BASE}manifest.json`, { cache: 'no-cache' });
    if (res.ok) manifest = new Set((await res.json()) as string[]);
  } catch {
    manifest = null;
  }
}

export const hasRecorded = (lang: Lang, text: string) => !!manifest?.has(audioKey(lang, text));

// ---------- Phát mp3 ----------
// Dùng chung một thẻ audio: trên iPhone, sau lần chạm đầu tiên thì phát tiếp không bị chặn
const player = typeof Audio !== 'undefined' ? new Audio() : null;
let endCurrent: (() => void) | null = null;

function playFile(url: string, slow: boolean): Promise<void> {
  return new Promise((resolve) => {
    if (!player) return resolve();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      player.onended = player.onerror = null;
      endCurrent = null;
      clearTimeout(timer);
      resolve();
    };
    endCurrent = finish;
    player.onended = finish;
    player.onerror = finish;
    const timer = setTimeout(finish, 20000);
    player.src = url;
    player.playbackRate = slow ? 0.7 : 1;
    player.preservesPitch = true;
    player.play().catch(finish);
  });
}

// ---------- Giọng trình duyệt (dự phòng) ----------
const voices: Record<Lang, SpeechSynthesisVoice | null> = { en: null, vi: null };

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const all = speechSynthesis.getVoices();
  const lang = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase().replace('_', '-') ?? '';
  voices.vi = all.find((v) => lang(v).startsWith('vi')) ?? null;
  const en = all.filter((v) => lang(v).startsWith('en-us'));
  voices.en =
    en.find((v) => /samantha|google us english|aria|jenny/i.test(v.name)) ??
    en[0] ??
    all.find((v) => lang(v).startsWith('en')) ??
    null;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function synth(text: string, lang: Lang, slow: boolean): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'en' ? 'en-US' : 'vi-VN';
    if (voices[lang]) u.voice = voices[lang];
    u.rate = slow ? 0.5 : lang === 'en' ? 0.8 : 0.95;
    u.pitch = 1.1;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    setTimeout(finish, 2000 + text.length * (slow ? 200 : 110));
    speechSynthesis.speak(u);
  });
}

// ---------- API chung ----------
let generation = 0;
let tail: Promise<void> = Promise.resolve();

/** Dừng mọi câu đang đọc và đang chờ */
export function stopSpeaking() {
  generation++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  player?.pause();
  endCurrent?.();
}
onSoundChange((on) => !on && stopSpeaking());

/** Đọc một câu. Trả về Promise xong khi đọc hết. */
export function speak(text: string, lang: Lang = 'en', opts: SpeakOpts = {}): Promise<void> {
  if (!opts.queue) stopSpeaking();
  const my = generation;
  const run = () => {
    if (my !== generation || !isSoundOn() || !text) return Promise.resolve();
    const slow = !!opts.slow;
    return hasRecorded(lang, text) ? playFile(`${BASE}${audioKey(lang, text)}.mp3`, slow) : synth(text, lang, slow);
  };
  tail = (opts.queue ? tail : Promise.resolve()).then(run, run);
  return tail;
}

/** Đọc lần lượt nhiều câu */
export async function speakAll(lines: { text: string; lang: Lang }[]) {
  for (let i = 0; i < lines.length; i++) await speak(lines[i].text, lines[i].lang, { queue: i > 0 });
}
