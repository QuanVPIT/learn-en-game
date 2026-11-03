import { useState } from 'react';
import { ACTIVITIES, GRADES, PLAYERS, TOPICS } from '../data';
import { BADGES } from '../data/badges';
import { levelOf } from '../data/levels';
import { emptyProgress, sumStars, totalStars, type AllProgress } from '../app/progress';
import { cx } from '../lib/cx';
import { Screen, Title, TopBar } from '../components/ui';

const CARD = 'w-full max-w-3xl rounded-3xl bg-white p-4 shadow-[0_5px_0_#0002]';
const H = 'm-0 mb-2 text-xl font-extrabold';

const fmt = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Báo cáo học tập cho bố mẹ: tổng quan, theo lớp, từ hay sai, lịch sử */
export function Report({ all, onBack }: { all: AllProgress; onBack: () => void }) {
  const [pid, setPid] = useState(PLAYERS[0].id);
  const p = all[pid] ?? emptyProgress();
  const answered = p.history.reduce((n, h) => n + h.total, 0);
  const correct = p.history.reduce((n, h) => n + h.correct, 0);
  const weak = Object.values(p.review).sort((a, b) => b.wrong - a.wrong);

  return (
    <Screen scroll>
      <TopBar onBack={onBack}>
        <Title>📊 Báo cáo cho bố mẹ</Title>
      </TopBar>

      <div className="flex gap-2">
        {PLAYERS.map((pl) => (
          <button
            key={pl.id}
            onClick={() => setPid(pl.id)}
            className={cx('rounded-full px-4 py-1.5 text-lg font-extrabold', pid === pl.id ? 'text-white' : 'bg-white')}
            style={pid === pl.id ? { background: pl.color, boxShadow: `0 4px 0 ${pl.shadow}` } : undefined}
          >
            {pl.face} {pl.name}
          </button>
        ))}
      </div>

      <div className={CARD}>
        <h3 className={H}>Tổng quan</h3>
        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          {[
            ['🌟', totalStars(p), 'sao'],
            ['🎮', p.sessions, 'lượt chơi'],
            ['🎯', answered ? `${Math.round((correct / answered) * 100)}%` : '–', 'trả lời đúng'],
            ['🔥', p.streak.count, 'ngày liên tiếp'],
          ].map(([icon, value, label]) => (
            <div key={label as string} className="rounded-2xl bg-sky-50 p-2">
              <div className="text-2xl">{icon}</div>
              <div className="text-2xl font-extrabold">{value}</div>
              <div className="text-sm opacity-75">{label}</div>
            </div>
          ))}
        </div>
        <p className="m-0 mt-2 text-center">
          🏅 {p.badges.length}/{BADGES.length} huy hiệu{' '}
          {p.badges.map((id) => BADGES.find((b) => b.id === id)?.icon).join(' ')}
        </p>
      </div>

      <div className={CARD}>
        <h3 className={H}>Theo lớp</h3>
        {GRADES.map((g) => {
          const topics = TOPICS.filter((t) => t.grade === g.id);
          const played = topics.filter((t) => sumStars(p.stars[t.id]) > 0);
          return (
            <details key={g.id} className="border-b border-black/5 py-1.5 last:border-0">
              <summary className="cursor-pointer text-lg font-bold">
                {g.label}: {played.length}/{topics.length} chủ đề có sao
              </summary>
              <div className="mt-1 flex flex-col gap-1 pl-2 text-base">
                {topics.map((t) => (
                  <div key={t.id} className="flex justify-between gap-2">
                    <span>
                      {t.icon} {t.title}
                    </span>
                    <span className="font-bold whitespace-nowrap">⭐ {sumStars(p.stars[t.id])}</span>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>

      <div className={CARD}>
        <h3 className={H}>📒 Từ hay sai ({weak.length})</h3>
        {weak.length === 0 ? (
          <p className="m-0 opacity-75">Chưa có từ nào bé hay sai.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {weak.slice(0, 30).map((r) => (
              <span key={r.topicId + r.en} className="rounded-full bg-red-50 px-3 py-1 font-bold">
                {r.en} <span className="text-bad">×{r.wrong}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={CARD}>
        <h3 className={H}>Lịch sử gần đây</h3>
        {p.history.length === 0 ? (
          <p className="m-0 opacity-75">Chưa có lượt chơi nào.</p>
        ) : (
          <div className="flex flex-col gap-1 text-base">
            {p.history.slice(0, 20).map((h, k) => {
              const t = TOPICS.find((x) => x.id === h.topicId);
              const a = ACTIVITIES.find((x) => x.id === h.activity);
              return (
                <div key={k} className="flex justify-between gap-2 border-b border-black/5 py-1 last:border-0">
                  <span>
                    <span className="opacity-60">{fmt(h.at)}</span> · {t ? `${t.icon} ${t.title}` : '📒 Sổ ôn tập'}
                    {a ? ` · ${a.title}` : ''} · {levelOf(h.level).label}
                  </span>
                  <span className={cx('font-extrabold whitespace-nowrap', h.correct === h.total ? 'text-good' : '')}>
                    {h.correct}/{h.total}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Screen>
  );
}
