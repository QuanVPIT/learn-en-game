import { useRef, useState } from 'react';

/** Cho phép chọn đúng 1 lần: trả về lựa chọn đã chọn và hàm chọn */
export function useOnce<T>() {
  const [picked, setPicked] = useState<T | null>(null);
  const done = useRef(false);
  const choose = (v: T, then: () => void) => {
    if (done.current) return;
    done.current = true;
    setPicked(v);
    then();
  };
  return [picked, choose] as const;
}
