// Lưu cài đặt và số sao trên máy. Lỗi (chế độ ẩn danh, bị chặn) thì bỏ qua.
const PREFIX = 'learnen.';

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v == null ? fallback : (JSON.parse(v) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* bỏ qua */
    }
  },
};
