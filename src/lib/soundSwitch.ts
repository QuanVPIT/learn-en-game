// Công tắc bật/tắt toàn bộ âm thanh (giọng đọc + hiệu ứng)
let on = true;
const listeners = new Set<(on: boolean) => void>();

export const isSoundOn = () => on;
export function setSoundOn(value: boolean) {
  on = value;
  listeners.forEach((fn) => fn(on));
}
export const onSoundChange = (fn: (on: boolean) => void) => listeners.add(fn);
