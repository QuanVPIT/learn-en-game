import { useEffect, useRef, useState } from 'react';
import { ACTIVITIES, PLAYERS, type Activity, type Player, type Topic } from '../data';
import type { LevelId } from '../data/levels';
import { PROMPTS } from '../data/phrases';
import { sfx } from '../lib/sfx';
import { setSoundOn } from '../lib/soundSwitch';
import { storage } from '../lib/storage';
import { speak, stopSpeaking } from '../lib/voice';
import { SoundToggle } from '../components/SoundToggle';
import { Welcome } from '../screens/Welcome';
import { Topics } from '../screens/Topics';
import { Activities } from '../screens/Activities';
import { Learn } from '../screens/Learn';
import { Session, type SessionMode } from '../screens/Session';
import { Badges } from '../screens/Badges';
import { Report } from '../screens/Report';
import { PlayerContext } from './player';
import {
  emptyProgress,
  migrate,
  recordAnswer,
  recordSession,
  type AllProgress,
  type PlayerProgress,
  type PlayerStars,
} from './progress';
import { buildQueue, buildReviewQueue, type QItem } from './quiz';

type ScreenName = 'welcome' | 'topics' | 'activities' | 'learn' | 'play' | 'badges' | 'report';

interface Play {
  id: number;
  items: QItem[];
  mode: SessionMode;
}

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('welcome');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [play, setPlay] = useState<Play | null>(null);
  const [soundOn, setSound] = useState(() => storage.get('sound', true));
  const [level, setLevel] = useState<LevelId>(() => storage.get('level', 'easy'));
  const [player, setPlayer] = useState<Player>(
    () => PLAYERS.find((p) => p.id === storage.get('player', '')) ?? PLAYERS[0],
  );
  const [all, setAll] = useState<AllProgress>(() =>
    migrate(
      storage.get<Record<string, PlayerStars> | null>('starsByPlayer', null),
      storage.get<AllProgress | null>('progress', null),
    ),
  );
  const mine: PlayerProgress = all[player.id] ?? emptyProgress();
  // Bản mới nhất của tiến độ (cho các hàm gọi từ lượt chơi đang chạy)
  const allRef = useRef(all);
  allRef.current = all;

  useEffect(() => {
    setSoundOn(soundOn);
    storage.set('sound', soundOn);
  }, [soundOn]);
  useEffect(() => storage.set('progress', all), [all]);
  useEffect(() => storage.set('player', player.id), [player]);
  useEffect(() => storage.set('level', level), [level]);

  const update = (fn: (p: PlayerProgress) => PlayerProgress) =>
    setAll((a) => ({ ...a, [player.id]: fn(a[player.id] ?? emptyProgress()) }));

  const go = (s: ScreenName) => {
    stopSpeaking();
    setScreen(s);
  };

  const choosePlayer = async (p: Player) => {
    sfx.pop();
    setPlayer(p);
    setScreen('topics');
    await speak(PROMPTS.hello(p), 'vi');
    await speak(PROMPTS.helloEn(p), 'en', { queue: true });
    void speak(PROMPTS.chooseTopic(p), 'vi', { queue: true });
  };

  const openTopic = (t: Topic) => {
    sfx.pop();
    setTopic(t);
    setScreen('activities');
    void speak(t.title, 'en');
  };

  const startPlay = (items: QItem[], mode: SessionMode) => {
    setPlay((p) => ({ id: (p?.id ?? 0) + 1, items, mode }));
    go('play');
  };

  const openActivity = (a: Activity) => {
    sfx.pop();
    setActivity(a);
    if (a.id === 'learn') return go('learn');
    if (topic) startPlay(buildQueue(topic, a, mine), 'normal');
  };

  const openReview = () => {
    sfx.pop();
    const items = buildReviewQueue(mine);
    if (items.length) {
      setActivity(null);
      startPlay(items, 'review');
    }
  };

  // Lượt chơi xong: lưu sao (chỉ lượt thường), lịch sử, chuỗi ngày, huy hiệu
  const finishPlay = (correct: number, total: number) => {
    const isReview = play?.mode === 'review' || !activity;
    const r = recordSession(
      allRef.current[player.id] ?? emptyProgress(),
      {
        topicId: isReview ? 'review' : (topic?.id ?? ''),
        activity: isReview ? 'review' : activity.id,
        correct,
        total,
        level,
      },
      { saveStars: play?.mode === 'normal' },
    );
    setAll((a) => ({ ...a, [player.id]: r.progress }));
    return r.newBadges;
  };

  const backFromPlay = () => go(play?.mode === 'review' ? 'topics' : 'activities');

  return (
    <PlayerContext.Provider value={player}>
      <div className="relative h-full">
        <SoundToggle on={soundOn} onToggle={() => setSound(!soundOn)} />

        {screen === 'welcome' && <Welcome onPick={choosePlayer} />}
        {screen === 'topics' && (
          <Topics
            progress={mine}
            onPick={openTopic}
            onBack={() => go('welcome')}
            onReview={openReview}
            onBadges={() => go('badges')}
            onReport={() => go('report')}
          />
        )}
        {screen === 'activities' && topic && (
          <Activities
            topic={topic}
            stars={mine.stars[topic.id] ?? {}}
            level={level}
            onLevel={setLevel}
            onPick={openActivity}
            onBack={() => go('topics')}
          />
        )}
        {screen === 'learn' && topic && (
          <Learn
            topic={topic}
            onBack={() => go('activities')}
            onPractice={() => openActivity(ACTIVITIES.find((a) => a.id === 'listen')!)}
          />
        )}
        {screen === 'play' && play && (
          <Session
            key={play.id}
            items={play.items}
            mode={play.mode}
            level={level}
            onAnswer={(q, ok) => update((p) => recordAnswer(p, q.topic.id, q.word.en, ok))}
            onFinish={finishPlay}
            onRetry={(wrong) => startPlay(wrong, play.mode === 'review' ? 'review' : 'retry')}
            onRestart={() => activity && topic && startPlay(buildQueue(topic, activity, mine), 'normal')}
            onBack={backFromPlay}
          />
        )}
        {screen === 'badges' && <Badges progress={mine} onBack={() => go('topics')} />}
        {screen === 'report' && <Report all={all} onBack={() => go('topics')} />}
      </div>
    </PlayerContext.Provider>
  );
}
