import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TOPICS, ACTIVITIES, shuffle, pick, options } from './data.js';
import { speak, cheer, oops, buzz, pop, finish, listenEn, canListen, setSoundEnabled, stopSpeaking } from './sound.js';

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
  const [stars, setStars] = useState(() => store.get('stars', {}));
  const [playId, setPlayId] = useState(0);

  useEffect(() => {
    setSoundEnabled(soundOn);
    store.set('sound', soundOn);
  }, [soundOn]);
  useEffect(() => store.set('stars', stars), [stars]);

  const saveStars = (n) =>
    setStars((s) => {
      const t = { ...(s[topic.id] || {}) };
      t[activity.id] = Math.max(t[activity.id] || 0, n);
      return { ...s, [topic.id]: t };
    });

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
    <div className="app">
      <button className="sound-btn" onClick={() => setSoundOn(!soundOn)} aria-label="Bật tắt âm thanh">
        {soundOn ? '🔊' : '🔇'}
      </button>

      {screen === 'welcome' && (
        <Welcome
          onStart={() => {
            setScreen('topics');
            speak('Nic Sún Răng muốn học chủ đề nào?', 'vi');
          }}
        />
      )}
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
  );
}

// ---------- Hình: emoji, chữ số hoặc ô màu ----------
function Pic({ pic }) {
  if (pic.startsWith('#')) return <span className="swatch" style={{ background: pic }} />;
  if (/^\d+$/.test(pic)) return <span className="num">{pic}</span>;
  return <span className="emoji">{pic}</span>;
}

// ---------- Màn chào ----------
function Welcome({ onStart }) {
  const greet = async () => {
    await speak('Xin chào Nic Sún Răng!', 'vi');
    speak("Hello Nic! Let's learn English!", 'en', { queue: true });
  };
  useEffect(() => {
    greet();
  }, []);

  return (
    <div className="screen welcome" onClick={greet}>
      <div className="tooth-face">😁</div>
      <h1 className="hello">
        Xin Chào
        <br />
        <span>Nic Sún Răng</span>
      </h1>
      <p className="sub">🦷 Hello Nic! Let's learn English! 🇬🇧</p>
      <button
        className="big-btn"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        ▶ Let's go!
      </button>
    </div>
  );
}

// ---------- Chọn chủ đề ----------
function Topics({ stars, onPick, onBack }) {
  const max = STAR_ACTIVITIES.length * 3;
  const total = Object.values(stars).reduce((n, t) => n + Object.values(t).reduce((a, b) => a + b, 0), 0);
  const group = (g, label) => (
    <>
      <h3 className="group">{label}</h3>
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
        <h2 className="title">Chọn chủ đề nào Nic! 📚</h2>
      </div>
      <div className="star-total">🌟 Tổng: {total} sao</div>
      {group(2, '📗 Lớp 2 – theo sách Tiếng Anh 2')}
      {group(1, '📘 Ôn lại lớp 1')}
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

      <button className="pill" onClick={() => speak(topic.sentence(w), 'en')}>
        💬 {topic.sentence(w)}
      </button>

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

// ---------- Một lượt chơi: 8 câu, tính sao ----------
const MIXED = ['listen', 'read', 'readSentence', 'spell', 'sentence'];

function buildQueue(topic, activity) {
  const canSpell = (w) => !w.en.includes(' ');
  let words = shuffle(topic.words);
  if (activity.id === 'spell') words = words.filter(canSpell);
  while (words.length < QUESTIONS) words = words.concat(shuffle(words));
  return words.slice(0, QUESTIONS).map((word, k) => {
    let type = activity.id;
    if (type === 'read') type = k % 2 ? 'readSentence' : 'read';
    if (type === 'challenge') type = pick(MIXED.filter((t) => t !== 'spell' || canSpell(word)));
    return { word, type };
  });
}

function Session({ topic, activity, onBack, onReplay, onStars }) {
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
        <p className="sub">{mistakes.current === 0 ? 'Không sai câu nào luôn!' : `Nic Sún Răng làm sai ${mistakes.current} câu`}</p>
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

// ---------- Nói: bé nói từ, máy nghe và chấm ----------
const SOUND_ALIKE = {
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
  bye: ['by', 'buy'],
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

function matches(heard, word) {
  const target = norm(word.en);
  const ok = [target, ...(SOUND_ALIKE[target] || [])];
  if (/^\d+$/.test(word.pic)) ok.push(word.pic);
  return heard.some((h) => {
    const n = norm(h);
    const words = n.split(' ');
    return ok.some((o) => n === o || words.includes(o) || (o.includes(' ') && n.includes(o)) || n.replace(/s$/, '') === o);
  });
}

function SpeakQ({ word, onRight, onWrong }) {
  const [state, setState] = useState('idle'); // idle | listening | manual
  const [heard, setHeard] = useState('');
  const [tries, setTries] = useState(0);
  const alive = useAlive();
  const supported = canListen();

  useEffect(() => {
    speak(word.en, 'en');
  }, []);

  const mic = async () => {
    if (state === 'listening') return;
    setState('listening');
    setHeard('');
    const r = await listenEn();
    if (!alive.current) return;
    if (!r || r.error === 'not-allowed' || r.error === 'service-not-allowed') {
      setState('manual');
      return;
    }
    setState('idle');
    setHeard(r.heard[0] || '…');
    if (matches(r.heard, word)) {
      onRight(word.en);
    } else {
      setTries((t) => t + 1);
      onWrong();
    }
  };

  const manual = !supported || state === 'manual';

  return (
    <div className="speak">
      <span className="ask-pic big">
        <Pic pic={word.pic} />
      </span>
      <div className="read-word">
        {word.en}
        <small>{word.vi}</small>
      </div>
      <button className="pill" onClick={() => speak(word.en, 'en')}>
        🔊 Nghe mẫu
      </button>

      {!manual && (
        <>
          <button className={'mic' + (state === 'listening' ? ' on' : '')} onClick={mic}>
            🎤
          </button>
          <div className="mic-hint">{state === 'listening' ? 'Nic nói đi…' : 'Bấm micro rồi nói'}</div>
          {heard && <div className="heard">Máy nghe được: “{heard}”</div>}
          {tries >= 3 && (
            <button className="pill" onClick={() => onRight(word.en)}>
              ⏭ Qua câu khác
            </button>
          )}
        </>
      )}

      {manual && (
        <>
          <div className="mic-hint">Máy này chưa nghe được micro. Bố mẹ nghe Nic nói rồi chấm nhé:</div>
          <div className="nav">
            <button className="big-btn small" onClick={() => onRight(word.en)}>
              ✅ Nói đúng rồi
            </button>
          </div>
        </>
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
