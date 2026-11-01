import { useEffect, useRef, useState } from 'react';
import { PROMPTS } from '../data/phrases';
import { usePlayer } from '../app/player';
import { sfx } from '../lib/sfx';
import {
  ERROR_TEXT,
  canRecognize,
  canRecord,
  inAppBrowser,
  listen,
  passScore,
  playUrl,
  scoreSpeech,
  startRecording,
  type ListenSession,
  type Recording,
  type Score,
} from '../lib/speech';
import { useAlive } from '../lib/useAlive';
import { speak } from '../lib/voice';
import { Pic } from '../components/Pic';
import { BigButton, Pill } from '../components/ui';
import { cx } from '../lib/cx';
import type { GameProps } from './types';

type Mode = 'auto' | 'record' | 'parent';

const NOTE = 'max-w-lg rounded-2xl bg-amber-100 px-3.5 py-2 text-center text-base font-bold';
const HINT = 'max-w-md text-center text-lg font-bold';

/** Nói từ / nói câu: máy nghe và chấm, hoặc thu âm cho bố mẹ chấm */
export function SpeakGame({ topic, word, sentenceMode, onRight, onWrong }: GameProps & { sentenceMode?: boolean }) {
  const player = usePlayer();
  const target = sentenceMode ? topic.sentence(word) : word.en;
  const recognize = canRecognize() && !inAppBrowser();
  const [mode, setMode] = useState<Mode>(recognize ? 'auto' : canRecord() ? 'record' : 'parent');
  const [state, setState] = useState<'idle' | 'listening' | 'recording' | 'recorded'>('idle');
  const [live, setLive] = useState('');
  const [result, setResult] = useState<Score | null>(null);
  const [error, setError] = useState('');
  const [tries, setTries] = useState(0);
  const [myVoice, setMyVoice] = useState<string | null>(null);
  const session = useRef<ListenSession | Recording | null>(null);
  const alive = useAlive();

  const model = () => speak(target, 'en');
  useEffect(() => {
    void model();
    return () => void session.current?.stop();
  }, []);

  // --- Máy tự nghe và chấm ---
  const startAuto = async () => {
    if (state === 'listening') return void session.current?.stop();
    setError('');
    setResult(null);
    setLive('');
    sfx.beep();
    const s = listen({ onLive: (t) => alive.current && setLive(t) });
    if (!s) return setMode(canRecord() ? 'record' : 'parent');
    session.current = s;
    setState('listening');
    const r = await s.done;
    if (!alive.current) return;
    setState('idle');
    if (r.error && !r.heard.length) {
      setError(ERROR_TEXT[r.error] ?? 'Máy chưa nghe được, con thử lại nhé!');
      // Lỗi quyền / dịch vụ: chuyển sang thu âm hoặc bố mẹ chấm để bé vẫn nói được
      if (
        ['not-allowed', 'service-not-allowed', 'network', 'language-not-supported', 'audio-capture'].includes(r.error)
      )
        setMode(canRecord() && !['audio-capture', 'not-allowed'].includes(r.error) ? 'record' : 'parent');
      return;
    }
    const sc = scoreSpeech(r.heard, target);
    setResult(sc);
    if (sc.score >= passScore(target)) {
      onRight(null);
    } else {
      setTries((t) => t + 1);
      onWrong(true);
      void speak(sc.score >= 0.4 ? PROMPTS.almost(player) : PROMPTS.listenAgain(player), 'vi');
    }
  };

  // --- Thu âm, bé nghe lại giọng mình, bố mẹ chấm ---
  const startRecord = async () => {
    if (state === 'recording') {
      const url = await (session.current as Recording).stop();
      if (!alive.current) return;
      setMyVoice(url);
      setState('recorded');
      playUrl(url);
      return;
    }
    setError('');
    try {
      sfx.beep();
      const r = await startRecording();
      session.current = r;
      setState('recording');
      void r.stopped.then((url) => {
        if (!alive.current) return;
        setMyVoice(url);
        setState('recorded');
      });
    } catch {
      setError('Không mở được micro. Bố mẹ cho phép dùng micro, hoặc nghe bé nói rồi chấm nhé.');
      setMode('parent');
    }
  };

  const micClass = (on: boolean, rec = false) =>
    cx(
      'size-[110px] rounded-full text-[56px]',
      on
        ? rec
          ? 'animate-breathe bg-bad shadow-[0_0_0_12px_#e5393544,0_7px_0_#a32020]'
          : 'animate-breathe bg-good shadow-[0_0_0_12px_#4cd96455,0_7px_0_#2e9e44]'
        : 'bg-brand shadow-[0_7px_0_var(--color-brand-dark)]',
    );

  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="rounded-[28px] bg-white px-4 py-1 text-[clamp(64px,16vw,110px)] leading-tight shadow-[0_6px_0_#0002]">
        <Pic pic={word.pic} />
      </span>

      {/* Từ / câu cần nói; sau khi chấm thì tô xanh (đúng) / đỏ (sai) từng từ */}
      <div className="flex flex-col items-center rounded-[28px] bg-white px-8 py-1.5 text-center leading-tight font-extrabold text-heading shadow-[0_6px_0_#0002]">
        <span className={sentenceMode ? 'text-[clamp(24px,6vw,40px)]' : 'text-[clamp(36px,9vw,60px)]'}>
          {result
            ? target.split(' ').map((w, k) => (
                <span key={k} className={result.words[k]?.ok ? 'text-good' : 'text-bad underline decoration-wavy'}>
                  {w}{' '}
                </span>
              ))
            : target}
        </span>
        <small className="text-base font-bold text-ink opacity-70">
          {sentenceMode ? `${word.vi} – nói cả câu` : word.vi}
        </small>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Pill onClick={model}>🔊 Nghe mẫu</Pill>
        <Pill onClick={() => speak(target, 'en', { slow: true })}>🐢 Nghe chậm</Pill>
      </div>

      {mode === 'auto' && (
        <>
          <button className={micClass(state === 'listening')} onClick={startAuto}>
            {state === 'listening' ? '👂' : '🎤'}
          </button>
          <div className={HINT}>
            {state === 'listening'
              ? `${player.short} nói đi… (bấm lần nữa khi nói xong)`
              : 'Bấm micro rồi nói to, rõ nhé'}
          </div>
          {state === 'listening' && (
            <div className="min-w-40 rounded-xl border-2 border-dashed border-good bg-white px-3.5 text-center text-lg italic">
              {live || '…'}
            </div>
          )}
          {result && state !== 'listening' && (
            <div className="rounded-xl bg-white px-3.5 text-lg">
              Máy nghe được: “{result.heard || '…'}” · <b>{Math.round(result.score * 100)}%</b>
            </div>
          )}
        </>
      )}

      {mode === 'record' && (
        <>
          <button className={micClass(state === 'recording', true)} onClick={startRecord}>
            {state === 'recording' ? '⏹️' : '🎤'}
          </button>
          <div className={HINT}>
            {state === 'recording'
              ? `${player.short} nói đi… rồi bấm ⏹️`
              : 'Bấm micro để thu giọng, rồi nghe lại so với mẫu'}
          </div>
          {myVoice && state === 'recorded' && (
            <>
              <Pill onClick={() => playUrl(myVoice)}>▶️ Nghe giọng {player.short}</Pill>
              <div className={HINT}>Bố mẹ nghe thử rồi chấm:</div>
              <div className="flex flex-wrap justify-center gap-3">
                <BigButton small onClick={() => onRight(null)}>
                  ✅ Nói đúng rồi
                </BigButton>
                <BigButton
                  small
                  alt
                  onClick={() => {
                    setMyVoice(null);
                    setState('idle');
                    onWrong(true);
                    void model();
                  }}
                >
                  🔁 Nói lại
                </BigButton>
              </div>
            </>
          )}
        </>
      )}

      {mode === 'parent' && (
        <>
          <div className={HINT}>Bố mẹ nghe {player.short} nói theo mẫu rồi chấm nhé:</div>
          <div className="flex flex-wrap justify-center gap-3">
            <BigButton small onClick={() => onRight(null)}>
              ✅ Nói đúng rồi
            </BigButton>
            {(recognize || canRecord()) && (
              <Pill
                onClick={() => {
                  setError('');
                  setMode(recognize ? 'auto' : 'record');
                }}
              >
                🎤 Thử lại micro
              </Pill>
            )}
          </div>
        </>
      )}

      {error && <div className={NOTE}>⚠️ {error}</div>}
      {mode === 'auto' && tries >= 2 && (
        <div className="flex flex-wrap justify-center gap-3">
          {canRecord() && <Pill onClick={() => setMode('record')}>🎙️ Thu âm, bố mẹ chấm</Pill>}
          <Pill onClick={() => onRight(null)}>⏭ Qua câu khác</Pill>
        </div>
      )}
      {inAppBrowser() && (
        <div className={NOTE}>
          💡 Đang mở trong Zalo/Facebook nên máy không nghe được. Bấm ⋯ rồi chọn “Mở bằng trình duyệt” (Safari/Chrome)
          để bé nói và máy chấm.
        </div>
      )}
    </div>
  );
}
