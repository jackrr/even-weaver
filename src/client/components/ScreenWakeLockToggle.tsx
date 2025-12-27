import { useEffect, useRef } from "react";
import { useLocalStorage } from "@/client/lib/store";

export default function ScreenWakeLockToggle() {
  const [lockEnabledValue, setLockEnabledValue] =
    useLocalStorage("screen-active-lock");

  const active = lockEnabledValue === "active";

  const wakeLock = useRef<WakeLockSentinel>(null);

  async function setWakeLock() {
    wakeLock.current = await navigator.wakeLock.request("screen");
  }

  useEffect(() => {
    if (active) {
      if (wakeLock.current) {
        if (!wakeLock.current.released) return;
        wakeLock.current = null;
      }

      setWakeLock();
    } else {
      if (wakeLock.current) {
        wakeLock.current.release();
        wakeLock.current = null;
      }
    }
  }, [active]);

  function toggle() {
    setLockEnabledValue(active ? "" : "active");
  }

  return (
    <div className="mx-4 flex flex-row cursor-pointer" onClick={toggle}>
      <div className="pr-2">Keep screen awake</div>
      <div className="toggle">
        <input type="checkbox" checked={active} readOnly />
        <span className="slider"></span>
      </div>
    </div>
  );
}
