// Tạo file giọng đọc mp3 bằng Google Cloud Text-to-Speech.
// Cách chạy: điền GOOGLE_TTS_API_KEY trong .env.local, rồi `npm run audio`.
// Câu nào đã có file thì bỏ qua, nên chạy lại chỉ tạo các câu mới.
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allPhrases } from '../src/data/phrases';
import { audioKey } from '../src/lib/audioKey';
import type { Lang } from '../src/data/types';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, 'public', 'audio');

// Đọc .env.local (không cần thư viện)
for (const file of ['.env.local', '.env']) {
  const p = join(ROOT, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const KEY = process.env.GOOGLE_TTS_API_KEY;
if (!KEY) {
  console.error('❌ Thiếu GOOGLE_TTS_API_KEY. Tạo file .env.local (xem .env.example) rồi chạy lại.');
  process.exit(1);
}

const VOICES: Record<Lang, { languageCode: string; name: string; speakingRate: number }> = {
  en: { languageCode: 'en-US', name: process.env.TTS_VOICE_EN || 'en-US-Neural2-F', speakingRate: 0.85 },
  vi: { languageCode: 'vi-VN', name: process.env.TTS_VOICE_VI || 'vi-VN-Neural2-A', speakingRate: 1 },
};

async function synthesize(lang: Lang, text: string): Promise<Buffer> {
  const { speakingRate, ...voice } = VOICES[lang];
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice,
      audioConfig: { audioEncoding: 'MP3', speakingRate, pitch: lang === 'en' ? 1 : 0 },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { audioContent: string };
  return Buffer.from(data.audioContent, 'base64');
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const phrases = allPhrases();
  const keys = new Set<string>();
  const todo = phrases.filter(({ lang, text }) => {
    const k = audioKey(lang, text);
    keys.add(k);
    return !existsSync(join(OUT, `${k}.mp3`));
  });
  console.log(`🎙️  ${phrases.length} câu, cần tạo mới ${todo.length} câu…`);

  let done = 0;
  let failed = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        const mp3 = await synthesize(item.lang, item.text);
        writeFileSync(join(OUT, `${audioKey(item.lang, item.text)}.mp3`), mp3);
      } catch (e) {
        failed++;
        console.error(`\n⚠️  Lỗi "${item.text}": ${(e as Error).message}`);
        if (String(e).includes('403') || String(e).includes('400')) process.exit(1);
      }
      done++;
      process.stdout.write(`\r   ${done}/${todo.length}`);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  // Xoá file của các câu không còn dùng
  let removed = 0;
  for (const f of readdirSync(OUT)) {
    if (f.endsWith('.mp3') && !keys.has(f.slice(0, -4))) {
      unlinkSync(join(OUT, f));
      removed++;
    }
  }

  const available = [...keys].filter((k) => existsSync(join(OUT, `${k}.mp3`))).sort();
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(available));
  console.log(`\n✅ Xong: ${available.length}/${keys.size} câu có giọng AI, lỗi ${failed}, xoá ${removed} file cũ.`);
}

void main();
