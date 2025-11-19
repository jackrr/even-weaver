import { useRef } from "react";

export function useDebounce(delay: number) {
  const lastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (effect: () => void) => {
    lastTimeout.current && clearTimeout(lastTimeout.current);
    lastTimeout.current = setTimeout(() => {
      effect();
    }, delay);
  };
}
