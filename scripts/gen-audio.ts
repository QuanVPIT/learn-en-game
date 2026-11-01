// Tạo file giọng đọc cho mọi câu trong game. Có 2 nguồn giọng:
//   npm run audio:mac  – giọng có sẵn của macOS (miễn phí, không cần tài khoản) → file .m4a
//   npm run audio      – Google Cloud Text-to-Speech (cần GOOGLE_TTS_API_KEY trong .env.local) → file .mp3
// Câu nào đã có file thì bỏ qua; thêm --force để tạo lại tất cả (vd. sau khi tải giọng mới).
import { execFile } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { allPhrases } from '../src/data/phrases';
import { audioKey } from '../src/lib/audioKey';
import type { Lang } from '../src/data/types';

const run = promisify(execFile);
const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, 'public', 'audio');
const MAC = process.argv.includes('--mac');
const FORCE = process.argv.includes('--force');
const EXT = MAC ? 'm4a' : 'mp3';

// Đọc .env.local (không cần thư viện)
for (const file of ['.env.local', '.env']) {
  const p = join(ROOT, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// ---------- Giọng macOS ----------
const MAC_VOICES: Record<Lang, { voice: string; rate: string }> = {
  en: { voice: process.env.TTS_MAC_EN || 'Samantha', rate: '150' },
  vi: { voice: process.env.TTS_MAC_VI || 'Linh', rate: '175' },
};
const TMP = MAC ? mkdtempSync(join(tmpdir(), 'tts-')) : '';

async function synthMac(lang: Lang, text: string, out: string) {
  const { voice, rate } = MAC_VOICES[lang];
  const aiff = join(TMP, `${audioKey(lang, text)}.aiff`);
  await run('say', ['-v', voice, '-r', rate, '-o', aiff, '--', text]);
  await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '32000', '-c', '1', aiff, out]);
  unlinkSync(aiff);
}

// ---------- Google Cloud ----------
const GOOGLE_VOICES: Record<Lang, { languageCode: string; name: string; speakingRate: number }> = {
  en: { languageCode: 'en-US', name: process.env.TTS_VOICE_EN || 'en-US-Neural2-F', speakingRate: 0.85 },
  vi: { languageCode: 'vi-VN', name: process.env.TTS_VOICE_VI || 'vi-VN-Neural2-A', speakingRate: 1 },
};

async function synthGoogle(lang: Lang, text: string, out: string) {
  const { speakingRate, ...voice } = GOOGLE_VOICES[lang];
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig: { audioEncoding: 'MP3', speakingRate },
      }),
    },
  );
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { audioContent: string };
  writeFileSync(out, Buffer.from(data.audioContent, 'base64'));
}

async function main() {
  if (!MAC && !process.env.GOOGLE_TTS_API_KEY) {
    console.error('❌ Thiếu GOOGLE_TTS_API_KEY trong .env.local. Hoặc dùng giọng Mac: npm run audio:mac');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });
  const phrases = allPhrases();
  const keys = new Set(phrases.map((p) => audioKey(p.lang, p.text)));
  const file = (k: string) => join(OUT, `${k}.${EXT}`);
  const todo = phrases.filter((p) => FORCE || !existsSync(file(audioKey(p.lang, p.text))));
  console.log(`🎙️  Giọng ${MAC ? 'macOS' : 'Google'}: ${phrases.length} câu, cần tạo ${todo.length} câu…`);

  let done = 0;
  let failed = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        const out = file(audioKey(item.lang, item.text));
        await (MAC ? synthMac : synthGoogle)(item.lang, item.text, out);
      } catch (e) {
        failed++;
        const msg = (e as Error).message;
        console.error(`\n⚠️  Lỗi "${item.text}": ${msg}`);
        // Lỗi key / quyền thì dừng luôn, không gọi tiếp
        if (/^(400|401|403) /.test(msg)) {
          console.error('\n❌ Key không dùng được với Text-to-Speech. Xem README phần "Giọng đọc".');
          process.exit(1);
        }
      }
      done++;
      process.stdout.write(`\r   ${done}/${todo.length}`);
    }
  };
  await Promise.all(Array.from({ length: MAC ? 8 : 6 }, worker));
  if (TMP) rmSync(TMP, { recursive: true, force: true });

  // Xoá file của câu không còn dùng, hoặc của nguồn giọng khác
  let removed = 0;
  for (const f of readdirSync(OUT)) {
    if (f === 'manifest.json') continue;
    const [k, ext] = f.split('.');
    if (ext !== EXT || !keys.has(k)) {
      unlinkSync(join(OUT, f));
      removed++;
    }
  }

  const files = [...keys].filter((k) => existsSync(file(k))).sort();
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ ext: EXT, files }));
  console.log(`\n✅ Xong: ${files.length}/${keys.size} câu có giọng đọc, lỗi ${failed}, xoá ${removed} file cũ.`);
}

void main();
