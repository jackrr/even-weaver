import { useEffect, useRef } from "react";

export function usePreventDefaultTapInteractions() {
  function preventPinchZoom(e: Event) {
    e.preventDefault();
    // special hack to prevent zoom-to-tabs gesture in safari
    document.body.style.zoom = "0.99";
  }

  const lastTouchEnd = useRef<number>(new Date().getTime());

  function preventDblTapZoom(e: TouchEvent) {
    var now = new Date().getTime();
    if (now - lastTouchEnd.current <= 300) {
      e.preventDefault();
    }
    lastTouchEnd.current = now;
  }

  useEffect(() => {
    document.addEventListener("gesturestart", preventPinchZoom, {
      passive: false,
    });
    document.addEventListener("gesturechange", preventPinchZoom, {
      passive: false,
    });
    document.addEventListener("gestureend", preventPinchZoom, {
      passive: false,
    });
    document.addEventListener("touchend", preventDblTapZoom, {
      passive: false,
    });

    return () => {
      document.removeEventListener("gesturestart", preventPinchZoom);
      document.removeEventListener("gesturechange", preventPinchZoom);
      document.removeEventListener("gestureend", preventPinchZoom);
      document.removeEventListener("touchend", preventDblTapZoom);
    };
  }, []);
}
