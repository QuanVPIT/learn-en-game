import { useEffect, useState } from 'react';
import { GRADES, TOPICS, type Grade, type Topic } from '../data';
import { activitiesFor } from '../data/lessons';
import { sfx } from '../lib/sfx';
import { storage } from '../lib/storage';
import { usePlayer } from '../app/player';
import { sumStars, type PlayerStars } from '../app/progress';
import { Screen, Title, TopBar } from '../components/ui';
import { cx } from '../lib/cx';

/** Chọn lớp và chủ đề */
export function Topics({
  stars,
  onPick,
  onBack,
}: {
  stars: PlayerStars;
  onPick: (t: Topic) => void;
  onBack: () => void;
}) {
  const player = usePlayer();
  const [grade, setGrade] = useState<Grade>(() => storage.get('grade', 2));
  useEffect(() => storage.set('grade', grade), [grade]);
  const total = Object.values(stars).reduce((n, t) => n + sumStars(t), 0);

  return (
    <Screen scroll>
      <TopBar onBack={onBack}>
        <Title>Chọn chủ đề nào {player.short}! 📚</Title>
      </TopBar>
      <button onClick={onBack} className="rounded-full bg-white px-4 py-1 text-[17px] font-bold shadow-[0_3px_0_#0002]">
        {player.face} {player.name} · <u>đổi bé</u>
      </button>
      <div className="rounded-full bg-white px-4 text-xl font-extrabold">🌟 Tổng: {total} sao</div>

      <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-full bg-white/50 p-1.5">
        {GRADES.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              sfx.pop();
              setGrade(g.id);
            }}
            className={cx(
              'flex flex-none flex-col items-center rounded-full px-4 py-1 text-lg leading-tight font-extrabold',
              grade === g.id && 'bg-brand text-white shadow-[0_4px_0_var(--color-brand-dark)]',
            )}
          >
            {g.label}
            <small className="text-[11px] font-semibold opacity-75">{g.note}</small>
          </button>
        ))}
      </div>

      <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {TOPICS.filter((t) => t.grade === grade).map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className="flex flex-col items-center rounded-3xl border-4 bg-white px-1.5 py-2.5 active:scale-95"
            style={{ borderColor: t.color, boxShadow: `0 5px 0 ${t.color}` }}
          >
            <span className="text-[46px] leading-tight">{t.icon}</span>
            <span className="text-center text-[17px] leading-tight font-extrabold">{t.title}</span>
            <span className="text-sm opacity-75">{t.vi}</span>
            <span className="text-sm font-bold">
              ⭐ {sumStars(stars[t.id])}/{(activitiesFor(t).length - 1) * 3}
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
