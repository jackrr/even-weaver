import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchWeave, updateWeave } from "@/client/lib/api";
import { useColorMap } from "@/client/lib/colors";
import { usePageTitle } from "@/client/lib/title";
import {
  useCallback,
  useRef,
  useState,
  type DragEventHandler,
  type TouchEvent,
  type TouchEventHandler,
  type WheelEventHandler,
} from "react";

const BASE_STITCH = 4;
const BASE_GAP = 1;
const MIN_ZOOM = 1;
const DEFAULT_ZOOM = 4;
const MAX_ZOOM = 20;

export default function Weave() {
  const { id } = useParams();
  const colors = useColorMap();
  const queryClient = useQueryClient();
  const { data: weave } = useQuery({
    queryKey: ["weave", id],
    queryFn: () => fetchWeave(id!),
    enabled: !!id,
  });

  const { mutate: toggleCellCompletion } = useMutation({
    mutationFn: async ({ x, y }: { x: number; y: number }) => {
      if (!id) return;
      pattern.toggleStitch(x, y);
      return updateWeave(id, name, pattern);
    },
    onSuccess: () => {
      // FIXME: race condition on multiple writes (maybe debounce this?)
      queryClient.invalidateQueries({ queryKey: ["weave", id] });
    },
  });

  usePageTitle(weave?.name);

  const [zoom, setZoomInternal] = useState(DEFAULT_ZOOM);
  const setZoom = useCallback(
    (setter: (prev: number) => number) => {
      setZoomInternal((prev) => {
        const next = setter(prev);
        // TODO: Zoom around center
        // get current "center"
        // calc new center
        // scroll to new center
        if (next < MIN_ZOOM) return MIN_ZOOM;
        if (next > MAX_ZOOM) return MAX_ZOOM;

        return next;
      });
    },
    [setZoomInternal],
  );

  const gridRef = useRef<HTMLDivElement>(null);
  const lastDragCoord = useRef<[number, number]>(null);
  const panStart = useCallback((x: number, y: number) => {
    lastDragCoord.current = [x, y];
  }, []);
  const panNext = useCallback((newX: number, newY: number) => {
    if (!lastDragCoord.current) return;
    if (!gridRef.current) return;

    const [prevX, prevY] = lastDragCoord.current;

    const dx = prevX - newX;
    const dy = prevY - newY;

    gridRef.current.scrollBy(dx, dy);
    lastDragCoord.current = [newX, newY];
  }, []);

  const onDragStart: DragEventHandler<HTMLDivElement> = useCallback((e) => {
    panStart(e.clientX, e.clientY);

    // Prevent "ghost" image
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    e.dataTransfer.setDragImage(img, 0, 0);
  }, []);

  const onDragEnd: DragEventHandler<HTMLDivElement> = useCallback(() => {
    lastDragCoord.current = null;
  }, []);

  const scaleDist = useRef<number>(null);
  const pinchDist = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 2) return null;
    const x0 = e.touches[0]!.pageX;
    const y0 = e.touches[0]!.pageY;
    const x1 = e.touches[1]!.pageX;
    const y1 = e.touches[1]!.pageY;

    return Math.hypot(x0 - x1, y0 - y1);
  }, []);

  const onTouchStart: TouchEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (e.touches.length === 1) {
        lastDragCoord.current = [e.touches[0]!.clientX, e.touches[0]!.clientY];
        return;
      }

      const dist = pinchDist(e);
      scaleDist.current = dist;
    },
    [pinchDist],
  );

  const onTouchMove: TouchEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (e.touches.length === 1) {
        panNext(e.touches[0]!.clientX, e.touches[0]!.clientY);
        return;
      }

      const dist = pinchDist(e);
      if (!dist) return;

      if (scaleDist.current) {
        const mag = (dist - scaleDist.current) / 5;
        setZoom((zoom) => zoom + mag);
      }

      scaleDist.current = dist;
    },
    [pinchDist, setZoom],
  );

  const onTouchEnd: TouchEventHandler<HTMLDivElement> = useCallback(() => {
    scaleDist.current = null;
    lastDragCoord.current = null;
  }, []);

  const onMouseWheel: WheelEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!gridRef.current) return;
      if (e.shiftKey) {
        // zoom
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY > 0) setZoom((zoom) => zoom / 2);
        if (e.deltaY < 0) setZoom((zoom) => zoom * 2);
      } else {
        // pan it
        gridRef.current.scrollBy(e.deltaX, e.deltaY);
      }
    },
    [setZoom],
  );

  if (!weave) return null;

  const { pattern, name } = weave;
  const { width, height } = pattern;
  const STITCH_SIZE = BASE_STITCH * zoom;
  const GAP = BASE_GAP * zoom;

  // TODO: long press cell trigger info popup
  // TODO: global summary (color mapping to names with totals, % complete) - can show in modal
  return (
    <>
      <h2>{name}</h2>
      <div
        className={`bg-gray-600 overflow-hidden grow`}
        onDragOver={(e) => panNext(e.clientX, e.clientY)}
        ref={gridRef}
        onDoubleClick={() => setZoom((zoom) => zoom * 2)}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
            height: height * (STITCH_SIZE + GAP),
            width: width * (STITCH_SIZE + GAP),
            gap: GAP,
            margin: `${STITCH_SIZE}px`,
          }}
          draggable
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onWheel={onMouseWheel}
        >
          {pattern.mapStitches(({ stitch, x, y }) => {
            const color = colors ? `#${colors[stitch.c]?.hex}` : "";
            return (
              <div
                className="flex content-center justify-center cursor-pointer"
                style={{
                  backgroundColor: color,
                  width: STITCH_SIZE,
                  height: STITCH_SIZE,
                }}
                key={`cell-${y}-${x}`}
                onClick={() => toggleCellCompletion({ x, y })}
              >
                {stitch.s === "done" ? (
                  <div
                    className=" text-gray-100 bg-black opacity-40 w-full h-full"
                    style={{
                      fontSize: STITCH_SIZE,
                      lineHeight: "100%",
                    }}
                  >
                    ✓
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
