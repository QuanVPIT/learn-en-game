import { useEffect, useState } from 'react';
import { GRADES, TOPICS, type Grade, type Topic } from '../data';
import { activitiesFor } from '../data/lessons';
import { sfx } from '../lib/sfx';
import { storage } from '../lib/storage';
import { cx } from '../lib/cx';
import { usePlayer } from '../app/player';
import { sumStars, totalStars, type PlayerProgress } from '../app/progress';
import { Screen, Title, TopBar } from '../components/ui';

const CHIP = 'rounded-full bg-white px-3.5 py-1 text-base font-extrabold shadow-[0_3px_0_#0002] active:translate-y-0.5';

/** Chọn lớp và chủ đề; lối vào Sổ ôn tập, Huy hiệu, Báo cáo bố mẹ */
export function Topics({
  progress,
  onPick,
  onBack,
  onReview,
  onBadges,
  onReport,
}: {
  progress: PlayerProgress;
  onPick: (t: Topic) => void;
  onBack: () => void;
  onReview: () => void;
  onBadges: () => void;
  onReport: () => void;
}) {
  const player = usePlayer();
  const [grade, setGrade] = useState<Grade>(() => storage.get('grade', 2));
  useEffect(() => storage.set('grade', grade), [grade]);
  const reviewCount = Object.keys(progress.review).length;

  return (
    <Screen scroll>
      <TopBar onBack={onBack}>
        <Title>Chọn chủ đề nào {player.short}! 📚</Title>
      </TopBar>

      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={onBack} className={CHIP}>
          {player.face} {player.name} · <u>đổi bé</u>
        </button>
        <span className={CHIP}>🌟 {totalStars(progress)} sao</span>
        <span className={CHIP}>🔥 {progress.streak.count} ngày</span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={onReview}
          disabled={!reviewCount}
          className={cx(CHIP, reviewCount ? 'bg-amber-200' : '')}
          title="Ôn lại những câu hay sai"
        >
          📒 Sổ ôn tập{reviewCount ? ` (${reviewCount})` : ''}
        </button>
        <button onClick={onBadges} className={CHIP}>
          🏅 Huy hiệu ({progress.badges.length})
        </button>
        <button onClick={onReport} className={CHIP}>
          📊 Bố mẹ
        </button>
      </div>

      {/* Thanh chọn lớp: 5 nút chia đều, luôn hiện đủ */}
      <div className="grid w-full max-w-xl grid-cols-5 gap-1 rounded-3xl bg-white/60 p-1">
        {GRADES.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              sfx.pop();
              setGrade(g.id);
            }}
            className={cx(
              'flex min-w-0 flex-col items-center rounded-2xl px-1 py-1.5 leading-tight font-extrabold',
              grade === g.id ? 'bg-brand text-white shadow-[0_4px_0_var(--color-brand-dark)]' : 'active:bg-white',
            )}
          >
            <span className="text-[clamp(15px,4vw,20px)] whitespace-nowrap">{g.label}</span>
            <small className="hidden text-[11px] font-semibold opacity-75 sm:block">{g.note}</small>
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
              ⭐ {sumStars(progress.stars[t.id])}/{(activitiesFor(t).length - 1) * 3}
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
