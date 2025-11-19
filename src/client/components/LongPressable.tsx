import { useCallback, useRef, type TouchEvent, type MouseEvent } from "react";

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

type PressableProps = Omit<
  DivProps,
  | "onTouchStart"
  | "onTouchMove"
  | "onTouchEnd"
  | "onMouseDown"
  | "onMouseLeave"
  | "onMouseUp"
  | "onMouseMove"
> & {
  onLongPress: () => void;
  threshold: number;
};

type MouseOrTouchEvent =
  | MouseEvent<HTMLDivElement>
  | TouchEvent<HTMLDivElement>;

function getTouchPoint(e: MouseOrTouchEvent): [number, number] | null {
  if ("touches" in e) {
    if (e.touches.length === 0) return null;

    const touch = e.touches[0]!;
    return [touch.clientX, touch.clientY];
  } else {
    return [e.clientX, e.clientY];
  }
}

const DRAG_THRESHOLD_PIXELS = 10;

export default function LongPressable({
  onLongPress,
  threshold,
  ...divProps
}: PressableProps) {
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);
  const startTouchPoint = useRef<[number, number]>(null);

  const onStart = useCallback(
    (e: MouseOrTouchEvent) => {
      timeout.current = setTimeout(onLongPress, threshold);
      startTouchPoint.current = getTouchPoint(e);
    },
    [threshold, onLongPress],
  );

  const onRelease = useCallback((e?: MouseOrTouchEvent) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    startTouchPoint.current = null;
  }, []);

  const onMove = useCallback(
    (e: MouseOrTouchEvent) => {
      const touchPoint = getTouchPoint(e);
      if (!touchPoint) {
        onRelease();
        return;
      }

      if (!startTouchPoint.current) return;
      const [x, y] = startTouchPoint.current;
      if (
        Math.abs(touchPoint[0] - x) >= DRAG_THRESHOLD_PIXELS ||
        Math.abs(touchPoint[1] - y) >= DRAG_THRESHOLD_PIXELS
      ) {
        onRelease();
      }
    },
    [onRelease],
  );

  return (
    <div
      onTouchStart={onStart}
      onTouchEnd={onRelease}
      onMouseDown={onStart}
      onMouseLeave={onRelease}
      onMouseUp={onRelease}
      onTouchMove={onMove}
      onMouseMove={onMove}
      {...divProps}
    />
  );
}
