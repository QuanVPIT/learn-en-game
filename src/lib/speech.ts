// Phần "Nói": nghe giọng bé (nhận diện giọng nói của trình duyệt), chấm điểm dễ tính cho trẻ,
// và thu âm để bé nghe lại giọng mình khi máy không nhận diện được.
import { stopSpeaking } from './voice';

// Kiểu tối giản cho Web Speech API (TypeScript chưa có sẵn)
interface RecAlt {
  transcript: string;
}
interface RecResult {
  isFinal: boolean;
  length: number;
  [i: number]: RecAlt;
}
interface RecEvent {
  results: { length: number; [i: number]: RecResult };
}
interface Recognizer {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: RecEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognizerCtor = new () => Recognizer;

const SR: RecognizerCtor | null =
  typeof window !== 'undefined'
    ? ((window as unknown as { SpeechRecognition?: RecognizerCtor; webkitSpeechRecognition?: RecognizerCtor })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: RecognizerCtor }).webkitSpeechRecognition ??
      null)
    : null;

export interface ListenResult {
  heard: string[];
  error?: string;
}
export interface ListenSession {
  done: Promise<ListenResult>;
  stop: () => void;
}
export interface Score {
  score: number;
  words: { w: string; ok: boolean }[];
  heard: string;
}

export const canRecognize = () => !!SR;
export const canRecord = () =>
  typeof navigator.mediaDevices?.getUserMedia === 'function' && typeof MediaRecorder !== 'undefined';

// Trình duyệt trong app (Zalo, Facebook, Messenger, Instagram...) thường chặn micro
export const inAppBrowser = () => /FBAN|FBAV|FB_IAB|Zalo|Instagram|Line\/|Messenger|TikTok/i.test(navigator.userAgent);

// Lời giải thích lỗi bằng tiếng Việt
export const ERROR_TEXT: Record<string, string> = {
  'no-speech': 'Máy chưa nghe thấy gì. Con nói to và gần micro hơn nhé!',
  'audio-capture': 'Không tìm thấy micro trên máy này.',
  'not-allowed': 'Chưa cho phép dùng micro. Bố mẹ bấm "Cho phép" khi trình duyệt hỏi nhé.',
  'service-not-allowed':
    'Máy chưa bật nhận diện giọng nói. Trên iPhone/iPad: Cài đặt → Cài đặt chung → Bàn phím → bật Đọc chính tả. Hoặc mở bằng Chrome.',
  network: 'Nhận diện giọng nói cần có mạng internet.',
  'language-not-supported': 'Máy chưa hỗ trợ nghe tiếng Anh.',
  aborted: 'Đã dừng nghe.',
  failed: 'Micro đang bận, con thử lại nhé!',
};

// Bắt đầu nghe. onLive(text) nhận chữ máy nghe được ngay khi bé đang nói.
// Trả về { done: Promise<{heard: string[], error?}>, stop() }
export function listen({
  onLive,
  maxMs = 7000,
}: { onLive?: (t: string) => void; maxMs?: number } = {}): ListenSession | null {
  if (!SR) return null;
  stopSpeaking();
  const rec = new SR();
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.maxAlternatives = 5;
  rec.continuous = false;

  let finals: string[] = [];
  let live = '';
  let settled = false;
  let resolveFn: (r: ListenResult) => void = () => {};
  const done = new Promise<ListenResult>((r) => (resolveFn = r));
  const finish = (extra: { error?: string } = {}) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    const heard = finals.length ? finals : live ? [live] : [];
    resolveFn({ heard, ...extra });
  };

  rec.onresult = (e) => {
    let text = '';
    for (let i = 0; i < e.results.length; i++) {
      const res = e.results[i];
      text += res[0].transcript;
      if (res.isFinal) finals = Array.from({ length: res.length }, (_, k) => res[k].transcript);
    }
    live = text.trim();
    onLive?.(live);
  };
  rec.onerror = (e) => {
    // "no-speech" mà đã nghe được chữ thì vẫn chấm bình thường
    if (e.error === 'no-speech' && live) return finish();
    finish({ error: e.error });
  };
  rec.onend = () => finish();

  const timer = setTimeout(() => {
    try {
      rec.stop();
    } catch {
      /* đã dừng */
    }
    setTimeout(() => finish(), 800);
  }, maxMs);

  try {
    rec.start();
  } catch {
    finish({ error: 'failed' });
  }

  return {
    done,
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* đã dừng */
      }
    },
  };
}

// ---------- Thu âm để bé nghe lại giọng mình ----------
export interface Recording {
  stop: () => Promise<string>;
  stopped: Promise<string>;
}

export async function startRecording(): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise<string>((resolve) => {
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      resolve(URL.createObjectURL(blob));
    };
  });
  rec.start();
  const timer = setTimeout(() => rec.state !== 'inactive' && rec.stop(), 6000);
  return {
    stop: () => {
      clearTimeout(timer);
      if (rec.state !== 'inactive') rec.stop();
      return stopped;
    },
    stopped,
  };
}

export function playUrl(url: string) {
  stopSpeaking();
  const a = new Audio(url);
  a.play().catch(() => {});
}

// ---------- Chấm điểm phát âm (dễ tính cho trẻ) ----------
// Từ hay bị máy nghe nhầm sang từ đồng âm
const SOUND_ALIKE: Record<string, string[]> = {
  one: ['won', '1'],
  two: ['to', 'too', '2'],
  four: ['for', '4'],
  eight: ['ate', '8'],
  sea: ['see', 'c'],
  sun: ['son'],
  bear: ['bare'],
  eye: ['i', 'aye'],
  tea: ['tee', 't'],
  ear: ['year'],
  hen: ['ten'],
  pen: ['pan', 'ben'],
  jeans: ['genes'],
  hi: ['high'],
  bye: ['by', 'buy'],
  hair: ['here', 'hare'],
  meat: ['meet'],
  cook: ['book'],
  plane: ['plain'],
  doll: ['dull', 'dole'],
  chess: ['jess'],
  nose: ['knows'],
  sing: ['sink'],
  mai: ['my', 'may', 'mine'],
};

const NUM_WORDS: Record<string, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  15: 'fifteen',
  20: 'twenty',
};

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\b(\d+)\b/g, (m) => NUM_WORDS[m] || m)
    .replace(/[^a-z0-9' ]/g, ' ')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function lev(a: string, b: string) {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

// Độ giống nhau của 2 từ: 1 = giống hệt
function wordSim(target: string, said: string) {
  if (target === said) return 1;
  if ((SOUND_ALIKE[target] || []).includes(said)) return 1;
  if (said === target + 's' || target === said + 's') return 0.95;
  // Bé nói thiếu đuôi (vd "swim" thay vì "swimming") vẫn tính gần đúng
  if (said.length >= 3 && target.startsWith(said)) return 0.8;
  const d = lev(target, said);
  return Math.max(0, 1 - d / Math.max(target.length, said.length));
}

// Chấm một câu/ từ: trả về { score 0..1, words: [{ w, ok }] , heard }
export function scoreSpeech(heardList: string[], targetText: string): Score {
  const target = norm(targetText).split(' ').filter(Boolean);
  let best: Score = { score: 0, words: target.map((w) => ({ w, ok: false })), heard: heardList[0] || '' };
  for (const h of heardList) {
    const said = norm(h).split(' ').filter(Boolean);
    if (!said.length) continue;
    // Cả cụm dính liền (vd "icecream") cũng tính
    const joined = said.join('');
    const words = target.map((w) => {
      const sim = Math.max(...said.map((s) => wordSim(w, s)), joined.includes(w) && w.length >= 3 ? 0.9 : 0);
      return { w, ok: sim >= 0.67 };
    });
    let score = words.filter((x) => x.ok).length / target.length;
    // Một từ: dùng độ giống cao nhất để chấm mềm hơn
    if (target.length === 1) score = Math.max(...said.map((s) => wordSim(target[0], s)), wordSim(target[0], joined));
    if (score > best.score) best = { score, words, heard: h };
  }
  return best;
}

// Ngưỡng đạt: từ đơn dễ hơn một chút
export const passScore = (targetText: string) => (norm(targetText).includes(' ') ? 0.6 : 0.67);
