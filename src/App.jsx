import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TOPICS, ACTIVITIES, PLAYERS, GRADES, shuffle, pick, options } from './data.js';
import { speak, cheer, oops, buzz, pop, finish, beep, setSoundEnabled, stopSpeaking, setPlayer } from './sound.js';
import { listen, canRecognize, canRecord, inAppBrowser, startRecording, playUrl, scoreSpeech, passScore, ERROR_TEXT } from './speech.js';

// Bé đang chơi
const PlayerCtx = createContext(PLAYERS[0]);
const usePlayer = () => useContext(PlayerCtx);

// ---------- Lưu tiến độ trên máy ----------
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('learnen.' + key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('learnen.' + key, JSON.stringify(value));
    } catch {}
  },
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const QUESTIONS = 8;
const STAR_ACTIVITIES = ACTIVITIES.filter((a) => a.id !== 'learn');

// Dùng trong các hàm async để biết màn hình còn mở không
function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
}

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [topic, setTopic] = useState(null);
  const [activity, setActivity] = useState(null);
  const [soundOn, setSoundOn] = useState(() => store.get('sound', true));
  const [player, setPlayerState] = useState(() => PLAYERS.find((p) => p.id === store.get('player')) || PLAYERS[0]);
  const [allStars, setAllStars] = useState(() => store.get('starsByPlayer', {}));
  const stars = allStars[player.id] || {};
  const [playId, setPlayId] = useState(0);

  useEffect(() => {
    setSoundEnabled(soundOn);
    store.set('sound', soundOn);
  }, [soundOn]);
  useEffect(() => store.set('starsByPlayer', allStars), [allStars]);
  useEffect(() => {
    setPlayer(player);
    store.set('player', player.id);
  }, [player]);

  const saveStars = (n) =>
    setAllStars((all) => {
      const mine = { ...(all[player.id] || {}) };
      const t = { ...(mine[topic.id] || {}) };
      t[activity.id] = Math.max(t[activity.id] || 0, n);
      mine[topic.id] = t;
      return { ...all, [player.id]: mine };
    });

  const choosePlayer = async (p) => {
    pop();
    setPlayer(p);
    setPlayerState(p);
    setScreen('topics');
    await speak(`Xin chào ${p.name}!`, 'vi');
    await speak(`Hello ${p.short}! Let's learn English!`, 'en', { queue: true });
    speak(`${p.name} muốn học chủ đề nào?`, 'vi', { queue: true });
  };

  const openTopic = (t) => {
    pop();
    setTopic(t);
    setScreen('activities');
    speak(t.title, 'en');
  };

  const openActivity = (a) => {
    pop();
    setActivity(a);
    setPlayId((n) => n + 1);
    setScreen(a.id === 'learn' ? 'learn' : 'play');
  };

  const toTopics = () => {
    stopSpeaking();
    setScreen('topics');
  };

  const toActivities = () => {
    stopSpeaking();
    setScreen('activities');
  };

  return (
    <PlayerCtx.Provider value={player}>
    <div className="app">
      <button className="sound-btn" onClick={() => setSoundOn(!soundOn)} aria-label="Bật tắt âm thanh">
        {soundOn ? '🔊' : '🔇'}
      </button>

      {screen === 'welcome' && <Welcome onPick={choosePlayer} />}
      {screen === 'topics' && <Topics stars={stars} onPick={openTopic} onBack={() => setScreen('welcome')} />}
      {screen === 'activities' && topic && (
        <Activities topic={topic} stars={stars[topic.id] || {}} onPick={openActivity} onBack={toTopics} />
      )}
      {screen === 'learn' && topic && (
        <Learn
          topic={topic}
          onBack={toActivities}
          onPractice={() => openActivity(ACTIVITIES.find((a) => a.id === 'listen'))}
        />
      )}
      {screen === 'play' && topic && activity && (
        <Session
          key={playId}
          topic={topic}
          activity={activity}
          onBack={toActivities}
          onReplay={() => openActivity(activity)}
          onStars={saveStars}
        />
      )}
    </div>
    </PlayerCtx.Provider>
  );
}

// ---------- Hình: emoji, chữ số hoặc ô màu ----------
function Pic({ pic }) {
  if (pic.startsWith('#')) return <span className="swatch" style={{ background: pic }} />;
  if (/^\d+$/.test(pic)) return <span className="num">{pic}</span>;
  return <span className="emoji">{pic}</span>;
}

// ---------- Màn chào: chọn bé đang chơi ----------
function Welcome({ onPick }) {
  const greet = () => speak('Xin chào các bé! Bé nào đang chơi đây nhỉ?', 'vi');
  useEffect(() => {
    greet();
  }, []);

  return (
    <div className="screen welcome">
      <div className="tooth-face">👋</div>
      <h1 className="hello">
        Xin Chào
        <br />
        <span>các bé!</span>
      </h1>
      <p className="sub">🇬🇧 Let's learn English! Bé nào đang chơi?</p>
      <div className="players">
        {PLAYERS.map((p) => (
          <button
            key={p.id}
            className="player-btn"
            style={{ background: p.color, boxShadow: `0 8px 0 ${p.shadow}` }}
            onClick={() => onPick(p)}
          >
            <span className="player-face">{p.face}</span>
            <span className="player-name">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Chọn chủ đề ----------
function Topics({ stars, onPick, onBack }) {
  const player = usePlayer();
  const max = STAR_ACTIVITIES.length * 3;
  const total = Object.values(stars).reduce((n, t) => n + Object.values(t).reduce((a, b) => a + b, 0), 0);
  const [grade, setGrade] = useState(() => store.get('grade', 2));
  useEffect(() => store.set('grade', grade), [grade]);
  const group = (g) => (
    <>
      <div className="topic-grid">
        {TOPICS.filter((t) => t.grade === g).map((t) => {
          const got = Object.values(stars[t.id] || {}).reduce((a, b) => a + b, 0);
          return (
            <button key={t.id} className="topic-card" style={{ '--c': t.color }} onClick={() => onPick(t)}>
              <span className="topic-icon">{t.icon}</span>
              <span className="topic-en">{t.title}</span>
              <span className="topic-vi">{t.vi}</span>
              <span className="topic-stars">
                ⭐ {got}/{max}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="screen scroll">
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <h2 className="title">Chọn chủ đề nào {player.short}! 📚</h2>
      </div>
      <button className="player-chip" onClick={onBack}>
        {player.face} {player.name} · <u>đổi bé</u>
      </button>
      <div className="star-total">🌟 Tổng: {total} sao</div>
      <div className="grade-tabs">
        {GRADES.map((g) => (
          <button
            key={g.id}
            className={grade === g.id ? 'on' : ''}
            onClick={() => {
              pop();
              setGrade(g.id);
            }}
          >
            {g.label}
            <small>{g.note}</small>
          </button>
        ))}
      </div>
      {group(grade)}
    </div>
  );
}

// ---------- Chọn hoạt động ----------
function Activities({ topic, stars, onPick, onBack }) {
  return (
    <div className="screen scroll">
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <h2 className="title">
          {topic.icon} {topic.title}
        </h2>
      </div>
      <p className="sub">{topic.vi} · Học từ trước rồi chơi nhé!</p>
      <div className="act-grid">
        {ACTIVITIES.map((a) => (
          <button key={a.id} className="act-card" style={{ background: a.color }} onClick={() => onPick(a)}>
            <span className="act-icon">{a.icon}</span>
            <span className="act-title">{a.title}</span>
            <span className="act-skill">{a.skill}</span>
            {a.id !== 'learn' && (
              <span className="act-stars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={n <= (stars[a.id] || 0) ? 'lit' : ''}>
                    ⭐
                  </span>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Học từ (thẻ từ) ----------
function Learn({ topic, onBack, onPractice }) {
  const [i, setI] = useState(0);
  const alive = useAlive();
  const w = topic.words[i];
  const last = i === topic.words.length - 1;

  const say = async () => {
    await speak(w.en, 'en');
    if (alive.current) speak(w.vi, 'vi', { queue: true });
  };

  useEffect(() => {
    say();
  }, [i]);

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <div className="progress">
          {i + 1} / {topic.words.length}
        </div>
      </div>

      <button className="flashcard" onClick={say}>
        <span className="flash-pic">
          <Pic pic={w.pic} />
        </span>
        <span className="flash-en">{w.en}</span>
        <span className="flash-vi">{w.vi}</span>
      </button>

      <Dialog topic={topic} word={w} />

      <div className="nav">
        <button className="round" disabled={i === 0} onClick={() => setI(i - 1)}>
          ◀
        </button>
        <button className="round" onClick={say}>
          🔊
        </button>
        {last ? (
          <button className="big-btn small" onClick={onPractice}>
            🎧 Chơi thôi!
          </button>
        ) : (
          <button className="round" onClick={() => setI(i + 1)}>
            ▶
          </button>
        )}
      </div>
    </div>
  );
}

// Câu mẫu (lớp 3 có cả câu hỏi và câu trả lời)
function Dialog({ topic, word }) {
  const sentence = topic.sentence(word);
  const lines = topic.ask ? (sentence.endsWith('?') ? [sentence, topic.ask] : [topic.ask, sentence]) : [sentence];
  const play = async () => {
    for (let k = 0; k < lines.length; k++) await speak(lines[k], 'en', { queue: k > 0 });
  };
  return (
    <button className="dialog" onClick={play}>
      {lines.map((l, k) => (
        <span key={k} className={'line' + (k % 2 ? ' reply' : '')}>
          {k === 0 ? '💬' : '↪️'} {l}
        </span>
      ))}
    </button>
  );
}

// ---------- Một lượt chơi: 8 câu, tính sao ----------
const MIXED = ['listen', 'read', 'readSentence', 'spell', 'sentence'];

function buildQueue(topic, activity) {
  const canSpell = (w) => !w.en.includes(' ');
  let words = shuffle(topic.words);
  // Chủ đề toàn cụm từ (vd "stand up") thì không ghép chữ được, chuyển sang xếp câu
  if (activity.id === 'spell' && words.some(canSpell)) words = words.filter(canSpell);
  while (words.length < QUESTIONS) words = words.concat(shuffle(words));
  return words.slice(0, QUESTIONS).map((word, k) => {
    let type = activity.id;
    if (type === 'read') type = k % 2 ? 'readSentence' : 'read';
    if (type === 'spell' && !canSpell(word)) type = 'sentence';
    if (type === 'challenge') type = pick(MIXED.filter((t) => t !== 'spell' || canSpell(word)));
    return { word, type };
  });
}

function Session({ topic, activity, onBack, onReplay, onStars }) {
  const player = usePlayer();
  const queue = useMemo(() => buildQueue(topic, activity), []);
  const [i, setI] = useState(0);
  const mistakes = useRef(0); // số câu có làm sai
  const wrongHere = useRef(false);
  const [msg, setMsg] = useState('');
  const [confetti, setConfetti] = useState(0);
  const [result, setResult] = useState(null);
  const locked = useRef(false);
  const alive = useAlive();

  const q = queue[i];

  const onWrong = (quiet) => {
    wrongHere.current = true;
    if (quiet) return buzz();
    const t = oops();
    setMsg(t);
    speak(t, 'vi');
  };

  const onRight = async (sayFirst) => {
    if (locked.current) return;
    locked.current = true;
    if (wrongHere.current) mistakes.current += 1;
    wrongHere.current = false;
    setConfetti((c) => c + 1);
    const c = cheer();
    setMsg(c.text);
    if (sayFirst) await speak(sayFirst, 'en');
    if (!alive.current) return;
    await speak(c.text, c.lang, { queue: true });
    await wait(300);
    if (!alive.current) return;
    if (i + 1 < queue.length) {
      setMsg('');
      setI(i + 1);
      locked.current = false;
    } else {
      const m = mistakes.current;
      const stars = m <= 1 ? 3 : m <= 3 ? 2 : 1;
      setResult(stars);
      onStars(stars);
      speak(finish(stars), 'vi');
    }
  };

  if (result) {
    return (
      <div className="screen result">
        <div className="result-stars">
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= result ? 'lit' : ''} style={{ animationDelay: `${n * 0.25}s` }}>
              ⭐
            </span>
          ))}
        </div>
        <h2 className="title">{result === 3 ? 'Tuyệt cú mèo!' : result === 2 ? 'Giỏi lắm!' : 'Cố lên nào!'}</h2>
        <p className="sub">{mistakes.current === 0 ? 'Không sai câu nào luôn!' : `${player.name} làm sai ${mistakes.current} câu`}</p>
        <div className="nav">
          <button className="big-btn small" onClick={onReplay}>
            🔁 Chơi lại
          </button>
          <button className="big-btn small alt" onClick={onBack}>
            ⬅ Trò khác
          </button>
        </div>
        <Confetti big />
      </div>
    );
  }

  const props = { topic, word: q.word, onRight, onWrong };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={onBack}>
          ⬅
        </button>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${(i / queue.length) * 100}%` }} />
        </div>
        <div className="progress">
          {i + 1}/{queue.length}
        </div>
      </div>

      <div className="question" key={i}>
        {q.type === 'listen' && <ChooseQ {...props} mode="listen" />}
        {q.type === 'read' && <ChooseQ {...props} mode="read" />}
        {q.type === 'readSentence' && <ChooseQ {...props} mode="readSentence" />}
        {q.type === 'spell' && <SpellQ {...props} />}
        {q.type === 'sentence' && <SentenceQ {...props} />}
        {q.type === 'speak' && <SpeakQ {...props} />}
        {q.type === 'speakSentence' && <SpeakQ {...props} sentenceMode />}
      </div>

      <div className="message">{msg}</div>
      {confetti > 0 && <Confetti key={confetti} />}
    </div>
  );
}

// ---------- Nghe / Đọc: chọn hình đúng ----------
function ChooseQ({ topic, word, mode, onRight, onWrong }) {
  const opts = useMemo(() => options(topic, word, 4), [word]);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);
  const sentence = topic.sentence(word);
  const hear = () => speak(mode === 'listen' ? word.en : sentence, 'en');

  useEffect(() => {
    if (mode === 'listen') hear();
  }, []);

  const tap = (w) => {
    if (done || wrong.includes(w.en)) return;
    if (w.en === word.en) {
      setDone(true);
      onRight(mode === 'listen' ? null : mode === 'read' ? word.en : sentence);
    } else {
      setWrong([...wrong, w.en]);
      onWrong();
    }
  };

  return (
    <>
      <div className="ask">
        {mode === 'listen' && (
          <button className="listen-btn" onClick={hear}>
            🔊
            <small>Nghe rồi chọn hình</small>
          </button>
        )}
        {mode === 'read' && (
          <div className="read-word">
            {word.en}
            <small>Đọc rồi chọn hình</small>
          </div>
        )}
        {mode === 'readSentence' && (
          <div className="read-sentence">
            {sentence}
            <small>Đọc câu rồi chọn hình</small>
          </div>
        )}
      </div>
      <div className="choices">
        {opts.map((w) => (
          <button
            key={w.en}
            className={'choice' + (wrong.includes(w.en) ? ' wrong' : '') + (done && w.en === word.en ? ' right' : '') + (done && w.en !== word.en ? ' faded' : '')}
            onClick={() => tap(w)}
          >
            <Pic pic={w.pic} />
            {(done || wrong.includes(w.en)) && <span className="choice-label">{w.en}</span>}
          </button>
        ))}
      </div>
    </>
  );
}

// ---------- Ghép chữ / xếp câu: chạm từng mảnh theo thứ tự ----------
function useTiles(parts, extra = []) {
  return useMemo(() => shuffle([...parts, ...extra].map((t, k) => ({ t, k }))), []);
}

function Builder({ parts, tiles, onRight, onWrong, sayDone, wide }) {
  const [used, setUsed] = useState([]);
  const [shake, setShake] = useState(null);
  const filled = used.length;
  const done = filled === parts.length;

  const tap = (tile) => {
    if (done || used.includes(tile.k)) return;
    if (tile.t.toLowerCase() === parts[filled].toLowerCase()) {
      pop();
      const nu = [...used, tile.k];
      setUsed(nu);
      if (nu.length === parts.length) onRight(sayDone);
    } else {
      setShake(tile.k);
      setTimeout(() => setShake(null), 450);
      onWrong(true);
    }
  };

  return (
    <>
      <div className={'slots' + (wide ? ' wide' : '') + (done ? ' done' : '')}>
        {parts.map((p, k) => (
          <span key={k} className={'slot' + (k < filled ? ' filled' : '') + (k === filled ? ' next' : '')}>
            {k < filled ? p : ''}
          </span>
        ))}
      </div>
      <div className={'tiles' + (wide ? ' wide' : '')}>
        {tiles.map((tile) => (
          <button
            key={tile.k}
            className={'tile' + (used.includes(tile.k) ? ' used' : '') + (shake === tile.k ? ' shake' : '')}
            onClick={() => tap(tile)}
          >
            {tile.t}
          </button>
        ))}
      </div>
    </>
  );
}

function SpellQ({ word, onRight, onWrong }) {
  const parts = word.en.split('');
  const tiles = useTiles(parts);
  useEffect(() => {
    speak(word.en, 'en');
  }, []);
  return (
    <>
      <div className="ask row">
        <span className="ask-pic">
          <Pic pic={word.pic} />
        </span>
        <div className="ask-side">
          <button className="pill" onClick={() => speak(word.en, 'en')}>
            🔊 Nghe
          </button>
          <span className="hint-vi">{word.vi}</span>
        </div>
      </div>
      <Builder parts={parts} tiles={tiles} onRight={onRight} onWrong={onWrong} sayDone={word.en} />
    </>
  );
}

function SentenceQ({ topic, word, onRight, onWrong }) {
  const sentence = topic.sentence(word);
  const parts = sentence.split(' ');
  const tiles = useTiles(parts);
  useEffect(() => {
    speak(sentence, 'en');
  }, []);
  return (
    <>
      <div className="ask row">
        <span className="ask-pic">
          <Pic pic={word.pic} />
        </span>
        <div className="ask-side">
          <button className="pill" onClick={() => speak(sentence, 'en')}>
            🔊 Nghe câu
          </button>
          <span className="hint-vi">Xếp các từ thành câu</span>
        </div>
      </div>
      <Builder parts={parts} tiles={tiles} onRight={onRight} onWrong={onWrong} sayDone={sentence} wide />
    </>
  );
}

// ---------- Nói: bé nói từ hoặc câu, máy nghe và chấm ----------
function SpeakQ({ topic, word, sentenceMode, onRight, onWrong }) {
  const player = usePlayer();
  const target = sentenceMode ? topic.sentence(word) : word.en;
  const recognize = canRecognize() && !inAppBrowser();
  const [mode, setMode] = useState(recognize ? 'auto' : canRecord() ? 'record' : 'parent');
  const [state, setState] = useState('idle'); // idle | listening | recording | recorded
  const [live, setLive] = useState('');
  const [result, setResult] = useState(null); // { score, words, heard }
  const [error, setError] = useState('');
  const [tries, setTries] = useState(0);
  const [myVoice, setMyVoice] = useState(null);
  const session = useRef(null);
  const alive = useAlive();

  const model = () => speak(target, 'en', { rate: sentenceMode ? 0.75 : 0.7 });
  useEffect(() => {
    model();
    return () => session.current?.stop?.();
  }, []);

  // --- Máy tự nghe và chấm ---
  const startAuto = async () => {
    if (state === 'listening') {
      session.current?.stop();
      return;
    }
    setError('');
    setResult(null);
    setLive('');
    beep();
    const s = listen({ onLive: (t) => alive.current && setLive(t) });
    if (!s) return setMode(canRecord() ? 'record' : 'parent');
    session.current = s;
    setState('listening');
    const r = await s.done;
    if (!alive.current) return;
    setState('idle');
    if (r.error && !r.heard.length) {
      setError(ERROR_TEXT[r.error] || 'Máy chưa nghe được, con thử lại nhé!');
      // Lỗi quyền / dịch vụ: chuyển sang thu âm để bé vẫn nói được
      if (['not-allowed', 'service-not-allowed', 'network', 'language-not-supported', 'audio-capture'].includes(r.error))
        setMode(canRecord() && r.error !== 'audio-capture' && r.error !== 'not-allowed' ? 'record' : 'parent');
      return;
    }
    const sc = scoreSpeech(r.heard, target);
    setResult(sc);
    if (sc.score >= passScore(target)) {
      onRight(null);
    } else {
      setTries((t) => t + 1);
      onWrong(true);
      speak(sc.score >= 0.4 ? `Gần đúng rồi! ${player.name} nói lại nha!` : `${player.name} nghe mẫu rồi nói lại nha!`, 'vi');
    }
  };

  // --- Thu âm, bé nghe lại giọng mình, bố mẹ chấm ---
  const startRecord = async () => {
    if (state === 'recording') {
      const url = await session.current.stop();
      if (!alive.current) return;
      setMyVoice(url);
      setState('recorded');
      playUrl(url);
      return;
    }
    setError('');
    try {
      beep();
      const r = await startRecording();
      session.current = r;
      setState('recording');
      r.stopped.then((url) => {
        if (!alive.current) return;
        setMyVoice(url);
        setState('recorded');
      });
    } catch {
      setError('Không mở được micro. Bố mẹ cho phép dùng micro, hoặc nghe bé nói rồi chấm nhé.');
      setMode('parent');
    }
  };

  const percent = result ? Math.round(result.score * 100) : 0;

  return (
    <div className="speak">
      <span className="ask-pic">
        <Pic pic={word.pic} />
      </span>

      {/* Từ / câu cần nói, tô màu từng từ sau khi chấm */}
      <div className={sentenceMode ? 'read-sentence' : 'read-word'}>
        <span className="say-words">
          {result
            ? target.split(' ').map((w, k) => (
                <span key={k} className={result.words[k]?.ok ? 'ok' : 'miss'}>
                  {w}{' '}
                </span>
              ))
            : target}
        </span>
        <small>{sentenceMode ? word.vi + ' – nói cả câu' : word.vi}</small>
      </div>

      <div className="nav">
        <button className="pill" onClick={model}>
          🔊 Nghe mẫu
        </button>
        <button className="pill" onClick={() => speak(target, 'en', { rate: 0.5 })}>
          🐢 Nghe chậm
        </button>
      </div>

      {mode === 'auto' && (
        <>
          <button className={'mic' + (state === 'listening' ? ' on' : '')} onClick={startAuto}>
            {state === 'listening' ? '👂' : '🎤'}
          </button>
          <div className="mic-hint">
            {state === 'listening' ? `${player.short} nói đi… (bấm lần nữa khi nói xong)` : 'Bấm micro rồi nói to, rõ nhé'}
          </div>
          {state === 'listening' && <div className="heard live">{live || '…'}</div>}
          {result && state !== 'listening' && (
            <div className="heard">
              Máy nghe được: “{result.heard || '…'}” · <b>{percent}%</b>
            </div>
          )}
        </>
      )}

      {mode === 'record' && (
        <>
          <button className={'mic' + (state === 'recording' ? ' on rec' : '')} onClick={startRecord}>
            {state === 'recording' ? '⏹️' : '🎤'}
          </button>
          <div className="mic-hint">
            {state === 'recording' ? `${player.short} nói đi… rồi bấm ⏹️` : 'Bấm micro để thu giọng, rồi nghe lại so với mẫu'}
          </div>
          {myVoice && state === 'recorded' && (
            <>
              <div className="nav">
                <button className="pill" onClick={() => playUrl(myVoice)}>
                  ▶️ Nghe giọng {player.short}
                </button>
              </div>
              <div className="mic-hint">Bố mẹ nghe thử rồi chấm:</div>
              <div className="nav">
                <button className="big-btn small" onClick={() => onRight(null)}>
                  ✅ Nói đúng rồi
                </button>
                <button
                  className="big-btn small alt"
                  onClick={() => {
                    setMyVoice(null);
                    setState('idle');
                    onWrong(true);
                    model();
                  }}
                >
                  🔁 Nói lại
                </button>
              </div>
            </>
          )}
        </>
      )}

      {mode === 'parent' && (
        <>
          <div className="mic-hint">Bố mẹ nghe {player.short} nói theo mẫu rồi chấm nhé:</div>
          <div className="nav">
            <button className="big-btn small" onClick={() => onRight(null)}>
              ✅ Nói đúng rồi
            </button>
            {(recognize || canRecord()) && (
              <button
                className="pill"
                onClick={() => {
                  setError('');
                  setMode(recognize ? 'auto' : 'record');
                }}
              >
                🎤 Thử lại micro
              </button>
            )}
          </div>
        </>
      )}

      {error && <div className="speak-error">⚠️ {error}</div>}
      {mode === 'auto' && inAppBrowser() === false && tries >= 2 && (
        <div className="nav">
          {canRecord() && (
            <button className="pill" onClick={() => setMode('record')}>
              🎙️ Thu âm, bố mẹ chấm
            </button>
          )}
          <button className="pill" onClick={() => onRight(null)}>
            ⏭ Qua câu khác
          </button>
        </div>
      )}
      {inAppBrowser() && (
        <div className="speak-error">
          💡 Đang mở trong Zalo/Facebook nên máy không nghe được. Bấm ⋯ rồi chọn “Mở bằng trình duyệt” (Safari/Chrome) để bé nói và máy chấm.
        </div>
      )}
    </div>
  );
}

// ---------- Pháo hoa ----------
const PIECES = ['⭐', '🎉', '🦷', '✨', '🌈', '🎈', '😁'];

function Confetti({ big }) {
  const n = big ? 40 : 18;
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: n }, (_, k) => (
        <span
          key={k}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            fontSize: `${20 + Math.random() * 24}px`,
          }}
        >
          {PIECES[k % PIECES.length]}
        </span>
      ))}
    </div>
  );
}
