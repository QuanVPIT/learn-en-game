export function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Bật tắt âm thanh"
      className="fixed top-3 right-3 z-20 size-[50px] rounded-full bg-white text-2xl shadow-[0_4px_0_#0002]"
    >
      {on ? '🔊' : '🔇'}
    </button>
  );
}
