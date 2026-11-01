import { useEffect, useState } from 'react';
import { ACTIVITIES, PLAYERS, type Activity, type Player, type Topic } from '../data';
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
import { Session } from '../screens/Session';
import { PlayerContext } from './player';
import { addStars, type AllStars } from './progress';

type ScreenName = 'welcome' | 'topics' | 'activities' | 'learn' | 'play';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('welcome');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [playId, setPlayId] = useState(0);
  const [soundOn, setSound] = useState(() => storage.get('sound', true));
  const [player, setPlayer] = useState<Player>(
    () => PLAYERS.find((p) => p.id === storage.get('player', '')) ?? PLAYERS[0],
  );
  const [allStars, setAllStars] = useState<AllStars>(() => storage.get('starsByPlayer', {}));

  useEffect(() => {
    setSoundOn(soundOn);
    storage.set('sound', soundOn);
  }, [soundOn]);
  useEffect(() => storage.set('starsByPlayer', allStars), [allStars]);
  useEffect(() => storage.set('player', player.id), [player]);

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

  const openActivity = (a: Activity) => {
    sfx.pop();
    setActivity(a);
    setPlayId((n) => n + 1);
    go(a.id === 'learn' ? 'learn' : 'play');
  };

  return (
    <PlayerContext.Provider value={player}>
      <div className="relative h-full">
        <SoundToggle on={soundOn} onToggle={() => setSound(!soundOn)} />

        {screen === 'welcome' && <Welcome onPick={choosePlayer} />}
        {screen === 'topics' && (
          <Topics stars={allStars[player.id] ?? {}} onPick={openTopic} onBack={() => go('welcome')} />
        )}
        {screen === 'activities' && topic && (
          <Activities
            topic={topic}
            stars={allStars[player.id]?.[topic.id] ?? {}}
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
        {screen === 'play' && topic && activity && (
          <Session
            key={playId}
            topic={topic}
            activity={activity}
            onBack={() => go('activities')}
            onReplay={() => openActivity(activity)}
            onStars={(n) => setAllStars((all) => addStars(all, player.id, topic.id, activity.id, n))}
          />
        )}
      </div>
    </PlayerContext.Provider>
  );
}
