import { useEffect, useRef } from 'react';

/** Cho các hàm async biết màn hình còn mở không (tránh cập nhật sau khi đã thoát) */
export function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
}
