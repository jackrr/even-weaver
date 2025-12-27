import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEventHandler,
  type TouchEvent,
  type TouchEventHandler,
  type WheelEventHandler,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { clamp } from "@/util/math";
import { fetchWeave, updateWeave } from "@/client/lib/api";
import { useColorMap } from "@/client/lib/colors";
import { useDebounce } from "@/client/lib/debounce";
import { usePageTitle } from "@/client/lib/title";
import DetailsModal from "./Weave/DetailsModal";
import SummaryModal from "./Weave/SummaryModal";
import Stitch from "./Weave/Stitch";

const BASE_STITCH = 4;
const BASE_GAP = 1;
const MIN_ZOOM = 1;
const DEFAULT_ZOOM = 4;
const MAX_ZOOM = 20;

export default function Weave() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const colors = useColorMap();
  const { data: weave } = useQuery({
    queryKey: ["weave", id],
    queryFn: () => fetchWeave(id!),
    enabled: !!id,
  });

  const debounceRefresh = useDebounce(1000);
  const { mutate: persistChanges } = useMutation({
    mutationFn: async () => {
      if (!id || !weave) return;
      const { name, pattern } = weave;
      return updateWeave(id, name, pattern);
    },
    onSuccess: () => {
      // Use a debounce to prevent race condition from causing "blink" of checkboxes
      debounceRefresh(() => {
        queryClient.invalidateQueries({ queryKey: ["weave", id] });
        queryClient.invalidateQueries({ queryKey: ["weaves"] });
      });
    },
  });

  usePageTitle(weave?.name);
  const canvas = useRef<HTMLCanvasElement>(null);

  const [zoom, setZoomInternal] = useState(DEFAULT_ZOOM);
  const prevZoom = useRef(DEFAULT_ZOOM);

  const setZoom = useCallback(
    (setter: (prev: number) => number) => {
      setZoomInternal((prev) => {
        let next = setter(prev);
        next = clamp(next, MIN_ZOOM, MAX_ZOOM);
        if (!weave || !canvas.current) return next;

        return next;
      });
    },
    [setZoomInternal, weave],
  );

  useEffect(() => {
    if (zoom === prevZoom.current) return;
    if (!canvas.current) return;

    // Zoom around "center"
    const {
      clientWidth: width,
      clientHeight: height,
      scrollTop,
      scrollLeft,
    } = canvas.current;
    const zoomRatio = zoom / prevZoom.current;

    const centerX = scrollLeft + width / 2;
    const centerY = scrollTop + height / 2;
    const newCenterX = centerX * zoomRatio;
    const newCenterY = centerY * zoomRatio;
    const newScrollX = newCenterX - width / 2;
    const newScrollY = newCenterY - height / 2;

    // TODO: zoom!
    // gridRef.current.scrollTo(newScrollX, newScrollY);
    prevZoom.current = zoom;
  }, [zoom]);

  const lastDragCoord = useRef<[number, number]>(null);

  const panNext = useCallback((newX: number, newY: number) => {
    if (!lastDragCoord.current) return;
    if (!canvas.current) return;

    const [prevX, prevY] = lastDragCoord.current;

    const dx = prevX - newX;
    const dy = prevY - newY;

    // TODO: pan it!
    // gridRef.current.scrollBy(dx, dy);
    lastDragCoord.current = [newX, newY];
  }, []);

  const scaleDist = useRef<number>(null);
  const pinchDist = useCallback((e: TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 2) return null;
    const x0 = e.touches[0]!.pageX;
    const y0 = e.touches[0]!.pageY;
    const x1 = e.touches[1]!.pageX;
    const y1 = e.touches[1]!.pageY;

    return Math.hypot(x0 - x1, y0 - y1);
  }, []);

  const onTouchStart: TouchEventHandler<HTMLCanvasElement> = useCallback(
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

  const onTouchMove: TouchEventHandler<HTMLCanvasElement> = useCallback(
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

  const onTouchEnd: TouchEventHandler<HTMLCanvasElement> = useCallback(() => {
    scaleDist.current = null;
    lastDragCoord.current = null;
  }, []);

  const onMouseWheel: WheelEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const WHEEL_INTERVAL = 1;
      if (!canvas.current) return;
      if (e.shiftKey) {
        // zoom
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY > 0) setZoom((zoom) => (zoom -= WHEEL_INTERVAL));
        if (e.deltaY < 0) setZoom((zoom) => (zoom += WHEEL_INTERVAL));
      } else {
        // pan it
        // TODO: pan it
      }
    },
    [setZoom],
  );

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<[number, number]>();

  const [activeColor, setActiveColor] = useState<number>();

  if (!weave || !colors) return null;

  const { pattern, name } = weave;
  const { width, height } = pattern;
  const stitchSize = BASE_STITCH * zoom;
  const stitchGap = BASE_GAP * zoom;

  // TODO: finish canvas rendering of stitches
  // TODO: click to complete stitch
  // TODO: long-press for stitch detail modal
  // TODO: zoom + pan behavior verification (desktop and mobile)

  return (
    <>
      <div className="flex flex-row text-lg">
        <button
          className="p-2 cursor-pointer"
          onClick={() => setSummaryOpen(true)}
        >
          &#128712;
        </button>
        <h2 className="my-2">{name}</h2>
      </div>
      <SummaryModal
        weave={weave}
        open={summaryOpen}
        toggleOpen={setSummaryOpen}
      />
      {selectedCell && (
        <DetailsModal
          weave={weave}
          cell={selectedCell}
          close={() => setSelectedCell(undefined)}
          activeColor={activeColor}
          setActiveColor={(id: number | undefined) => setActiveColor(id)}
        />
      )}
      <canvas
        ref={canvas}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onMouseWheel}
      />
    </>
  );
}
