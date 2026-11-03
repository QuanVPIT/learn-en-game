import { BADGES } from '../data/badges';
import { usePlayer } from '../app/player';
import type { PlayerProgress } from '../app/progress';
import { cx } from '../lib/cx';
import { Screen, Title, TopBar } from '../components/ui';

/** Bộ sưu tập huy hiệu của bé (huy hiệu chưa đạt hiện mờ) */
export function Badges({ progress, onBack }: { progress: PlayerProgress; onBack: () => void }) {
  const player = usePlayer();
  return (
    <Screen scroll>
      <TopBar onBack={onBack}>
        <Title>🏅 Huy hiệu của {player.short}</Title>
      </TopBar>
      <p className="m-0 text-lg font-bold">
        {progress.badges.length}/{BADGES.length} huy hiệu · 🔥 chuỗi {progress.streak.count} ngày
      </p>
      <div className="grid w-full max-w-3xl grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
        {BADGES.map((b) => {
          const has = progress.badges.includes(b.id);
          return (
            <div
              key={b.id}
              className={cx(
                'flex flex-col items-center rounded-3xl bg-white p-3 text-center shadow-[0_5px_0_#0002]',
                !has && 'opacity-50',
              )}
            >
              <span className={cx('text-5xl leading-tight', !has && 'grayscale')}>{has ? b.icon : '🔒'}</span>
              <span className="font-extrabold">{b.name}</span>
              <span className="text-sm opacity-75">{b.desc}</span>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
