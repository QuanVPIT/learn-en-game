import type { Activity, Topic } from '../data';
import { activitiesFor } from '../data/lessons';
import type { TopicStars } from '../app/progress';
import { Screen, Stars, Title, TopBar } from '../components/ui';

/** Chọn trò chơi trong một chủ đề */
export function Activities({
  topic,
  stars,
  onPick,
  onBack,
}: {
  topic: Topic;
  stars: TopicStars;
  onPick: (a: Activity) => void;
  onBack: () => void;
}) {
  return (
    <Screen scroll>
      <TopBar onBack={onBack}>
        <Title>
          {topic.icon} {topic.title}
        </Title>
      </TopBar>
      <p className="m-0 text-center text-[clamp(16px,4vw,22px)] font-bold">{topic.vi} · Học từ trước rồi chơi nhé!</p>
      <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {activitiesFor(topic).map((a) => (
          <button
            key={a.id}
            onClick={() => onPick(a)}
            className="flex flex-col items-center rounded-[26px] px-1.5 py-3 shadow-[0_6px_0_#0002] active:scale-95"
            style={{ background: a.color }}
          >
            <span className="text-[52px] leading-tight">{a.icon}</span>
            <span className="text-xl font-extrabold">{a.title}</span>
            <span className="rounded-full bg-white/50 px-2.5 text-sm font-bold">{a.skill}</span>
            {a.id !== 'learn' && <Stars count={stars[a.id] ?? 0} />}
          </button>
        ))}
      </div>
    </Screen>
  );
}
