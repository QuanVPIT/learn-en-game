import type { Activity, Topic } from '../data';
import { LEVELS, type LevelId } from '../data/levels';
import { cx } from '../lib/cx';
import { sfx } from '../lib/sfx';
import { activitiesFor } from '../data/lessons';
import type { TopicStars } from '../app/progress';
import { Screen, Stars, Title, TopBar } from '../components/ui';

/** Chọn trò chơi trong một chủ đề */
export function Activities({
  topic,
  stars,
  level,
  onLevel,
  onPick,
  onBack,
}: {
  topic: Topic;
  stars: TopicStars;
  level: LevelId;
  onLevel: (l: LevelId) => void;
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
      {/* Độ khó: thời gian cho mỗi câu */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-bold opacity-75">Độ khó (thời gian mỗi câu)</span>
        <div className="grid grid-cols-3 gap-1 rounded-3xl bg-white/60 p-1">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                sfx.pop();
                onLevel(l.id);
              }}
              className={cx(
                'flex flex-col items-center rounded-2xl px-3 py-1 leading-tight font-extrabold',
                level === l.id ? 'bg-violet text-white shadow-[0_4px_0_var(--color-violet-dark)]' : '',
              )}
            >
              <span className="text-lg whitespace-nowrap">
                {l.icon} {l.label}
              </span>
              <small className="text-xs font-semibold opacity-80">{l.seconds} giây</small>
            </button>
          ))}
        </div>
      </div>
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
