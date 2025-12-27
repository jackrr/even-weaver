import { useState } from "react";

export function useLocalStorage(
  key: string,
): [string | null, (v: string) => void] {
  const [current, setCurrent] = useState(localStorage.getItem(key));

  function setValue(newValue: string) {
    localStorage.setItem(key, newValue);
    setCurrent(newValue);
  }

  return [current, setValue];
}
