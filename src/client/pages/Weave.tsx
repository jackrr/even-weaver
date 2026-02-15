import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { clamp } from "@/util/math";
import { fetchWeave, updateWeave, type Color } from "@/client/lib/api";
import { useColorMap } from "@/client/lib/colors";
import { useDebounce } from "@/client/lib/debounce";
import { usePageTitle } from "@/client/lib/title";
import DetailsModal from "./Weave/DetailsModal";
import SummaryModal from "./Weave/SummaryModal";
import { Status } from "@/util/pattern";

const BASE_STITCH = 4;
const BASE_GAP = 1;
const CELL_SIZE = BASE_STITCH + BASE_GAP; // 5 base units per cell
const MIN_ZOOM = 1;
const DEFAULT_ZOOM = 4;
const MAX_ZOOM = 20;
const LONG_PRESS_MS = 200;
const DRAG_THRESHOLD = 10;

function stripeColor(color: Color): string {
  return color.r + color.g + color.b > 300 ? "#333333" : "#888888";
}

// Replicates the CSS: repeating-linear-gradient(-45deg, transparent 0, transparent size/6, color size/6, color size/3)
function drawStripes(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, size, size);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = size / 6;
  // Lines spaced size/3 apart (perpendicular), each line has width size/6 → 50% coverage
  const step = (size / 3) * Math.SQRT2;
  ctx.beginPath();
  for (let t = -size; t < size * 2; t += step) {
    ctx.moveTo(px, py + t);
    ctx.lineTo(px + size, py + t - size); // "/" direction, matching -45deg CSS gradient
  }
  ctx.stroke();
  ctx.restore();
}

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
      debounceRefresh(() => {
        queryClient.invalidateQueries({ queryKey: ["weave", id] });
        queryClient.invalidateQueries({ queryKey: ["weaves"] });
      });
    },
  });

  usePageTitle(weave?.name);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep latest persistChanges in a ref so event handlers don't need it as a dep
  const persistRef = useRef(persistChanges);
  persistRef.current = persistChanges;

  // Rendering state in refs — never trigger React re-renders for pan/zoom/draw
  const zoomRef = useRef(DEFAULT_ZOOM);
  const offsetRef = useRef({ x: 0, y: 0 });
  const activeColorRef = useRef<number | undefined>(undefined);
  const drawRef = useRef<() => void>(() => {});

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<[number, number]>();
  const [activeColor, setActiveColor] = useState<number | undefined>();

  // Sync activeColor into ref and redraw whenever it changes
  useEffect(() => {
    activeColorRef.current = activeColor;
    drawRef.current();
  }, [activeColor]);

  // Main canvas setup — re-runs when data loads/changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !weave || !colors) return;
    // Narrowed captures for use inside closures — TypeScript doesn't propagate
    // control-flow narrowing into nested functions
    const cv = canvas;
    const wv = weave;
    const cs = colors;

    // ── Drawing ────────────────────────────────────────────────────────────────

    function draw() {
      const ctx = cv.getContext("2d");
      if (!ctx) return;

      const zoom = zoomRef.current;
      const { x: offsetX, y: offsetY } = offsetRef.current;
      const { pattern } = wv;
      const { width, height } = pattern;
      const stitchSize = BASE_STITCH * zoom;
      const cellSize = CELL_SIZE * zoom;
      const margin = stitchSize; // one stitch-width margin on all sides

      ctx.clearRect(0, 0, cv.width, cv.height);

      const activeColor = activeColorRef.current;
      pattern.eachStitch(({ stitch, x, y }) => {
        const color = cs[stitch[0]]!;
        const px = x * cellSize + margin - offsetX;
        const py = y * cellSize + margin - offsetY;

        // Cull stitches outside viewport
        if (px + stitchSize < 0 || px > cv.width) return;
        if (py + stitchSize < 0 || py > cv.height) return;

        ctx.globalAlpha =
          activeColor !== undefined && activeColor !== color.id ? 0.1 : 1.0;
        ctx.fillStyle = `#${color.hex}`;
        ctx.fillRect(px, py, stitchSize, stitchSize);

        if (stitch[1] === Status.DONE) {
          drawStripes(ctx, px, py, stitchSize, stripeColor(color));
        }
      });

      ctx.globalAlpha = 1.0;

      // Grid lines every 10 stitches
      ctx.fillStyle = "#000000";
      for (let xi = 1; xi < Math.floor(width / 10); xi++) {
        const sx = xi * cellSize * 10 + margin - offsetX;
        if (sx >= 0 && sx <= cv.width) ctx.fillRect(sx - 1, 0, 2, cv.height);
      }
      for (let yi = 1; yi < Math.floor(height / 10); yi++) {
        const sy = yi * cellSize * 10 + margin - offsetY;
        if (sy >= 0 && sy <= cv.height) ctx.fillRect(0, sy - 1, cv.width, 2);
      }
    }

    drawRef.current = draw;

    // Batch draw calls during continuous events (pan/zoom)
    let rafPending = false;
    function scheduleDraw() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        draw();
      });
    }

    // ── Coordinate helpers ─────────────────────────────────────────────────────

    function toGrid(cx: number, cy: number): [number, number] | null {
      const zoom = zoomRef.current;
      const stitchSize = BASE_STITCH * zoom;
      const cellSize = CELL_SIZE * zoom;
      const margin = stitchSize;
      const wx = cx + offsetRef.current.x - margin;
      const wy = cy + offsetRef.current.y - margin;
      if (wx < 0 || wy < 0) return null;
      const gx = Math.floor(wx / cellSize);
      const gy = Math.floor(wy / cellSize);
      // Reject clicks in the gap between stitches
      if (wx - gx * cellSize > stitchSize) return null;
      if (wy - gy * cellSize > stitchSize) return null;
      if (gx >= wv.pattern.width || gy >= wv.pattern.height) return null;
      return [gx, gy];
    }

    function applyZoom(delta: number, cx: number, cy: number) {
      const prev = zoomRef.current;
      const next = clamp(prev + delta, MIN_ZOOM, MAX_ZOOM);
      if (next === prev) return;
      const ratio = next / prev;
      // Keep the world point under (cx, cy) stationary
      offsetRef.current.x = (cx + offsetRef.current.x) * ratio - cx;
      offsetRef.current.y = (cy + offsetRef.current.y) * ratio - cy;
      zoomRef.current = next;
      scheduleDraw();
    }

    // ── Resize ─────────────────────────────────────────────────────────────────

    const ro = new ResizeObserver(() => {
      cv.width = cv.clientWidth;
      cv.height = cv.clientHeight;
      draw();
    });
    ro.observe(cv);
    cv.width = cv.clientWidth;
    cv.height = cv.clientHeight;
    draw();

    // ── Shared press / drag state ──────────────────────────────────────────────

    let pressStart: { x: number; y: number } | null = null;
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    let dragging = false;

    function startPress(cx: number, cy: number) {
      pressStart = { x: cx, y: cy };
      dragging = false;
      longPressTimer = setTimeout(() => {
        longPressTimer = null;
        const cell = toGrid(cx, cy);
        if (cell) setSelectedCell(cell);
      }, LONG_PRESS_MS);
    }

    function cancelPress() {
      if (longPressTimer !== null) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      pressStart = null;
    }

    function checkDrag(cx: number, cy: number) {
      if (!pressStart) return;
      if (
        Math.abs(cx - pressStart.x) > DRAG_THRESHOLD ||
        Math.abs(cy - pressStart.y) > DRAG_THRESHOLD
      ) {
        cancelPress();
        dragging = true;
      }
    }

    // Commit a tap: toggle the stitch if it was a short press without dragging
    function commitTap(cx: number, cy: number) {
      if (!dragging && longPressTimer !== null) {
        cancelPress();
        const cell = toGrid(cx, cy);
        if (cell) {
          wv.pattern.toggleStitch(cell[0], cell[1]);
          persistRef.current();
          draw(); // immediate feedback — no React re-render needed
        }
      } else {
        cancelPress();
      }
    }

    // ── Mouse ──────────────────────────────────────────────────────────────────

    let mouseDown = false;
    let lastMouse: { x: number; y: number } | null = null;

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      mouseDown = true;
      const rect = cv.getBoundingClientRect();
      lastMouse = { x: e.clientX, y: e.clientY };
      startPress(e.clientX - rect.left, e.clientY - rect.top);
    }

    function onMouseMove(e: MouseEvent) {
      if (!mouseDown || !lastMouse) return;
      const rect = cv.getBoundingClientRect();
      checkDrag(e.clientX - rect.left, e.clientY - rect.top);
      offsetRef.current.x += lastMouse.x - e.clientX;
      offsetRef.current.y += lastMouse.y - e.clientY;
      lastMouse = { x: e.clientX, y: e.clientY };
      scheduleDraw();
    }

    function onMouseUp(e: MouseEvent) {
      if (e.button !== 0) return;
      const rect = cv.getBoundingClientRect();
      commitTap(e.clientX - rect.left, e.clientY - rect.top);
      mouseDown = false;
      lastMouse = null;
      dragging = false;
    }

    function onMouseLeave() {
      cancelPress();
      mouseDown = false;
      lastMouse = null;
      dragging = false;
    }

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const cell = toGrid(e.clientX - rect.left, e.clientY - rect.top);
      if (cell) setSelectedCell(cell);
    }

    function onWheel(e: WheelEvent) {
      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const rect = cv.getBoundingClientRect();
        applyZoom(
          e.deltaY > 0 ? -1 : 1,
          e.clientX - rect.left,
          e.clientY - rect.top,
        );
      } else {
        offsetRef.current.x += e.deltaX;
        offsetRef.current.y += e.deltaY;
        scheduleDraw();
      }
    }

    // ── Touch ──────────────────────────────────────────────────────────────────

    let lastTouch: { x: number; y: number } | null = null;
    let pinchDist: number | null = null;
    let touchStartCanvas: { x: number; y: number } | null = null;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        const t = e.touches[0]!;
        const rect = cv.getBoundingClientRect();
        const cx = t.clientX - rect.left;
        const cy = t.clientY - rect.top;
        lastTouch = { x: t.clientX, y: t.clientY };
        touchStartCanvas = { x: cx, y: cy };
        startPress(cx, cy);
      } else if (e.touches.length === 2) {
        cancelPress();
        lastTouch = null;
        touchStartCanvas = null;
        const [t0, t1] = [e.touches[0]!, e.touches[1]!];
        pinchDist = Math.hypot(t0.pageX - t1.pageX, t0.pageY - t1.pageY);
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault(); // prevent page scroll/zoom while interacting with canvas
      if (e.touches.length === 1 && lastTouch) {
        const t = e.touches[0]!;
        const rect = cv.getBoundingClientRect();
        checkDrag(t.clientX - rect.left, t.clientY - rect.top);
        offsetRef.current.x += lastTouch.x - t.clientX;
        offsetRef.current.y += lastTouch.y - t.clientY;
        lastTouch = { x: t.clientX, y: t.clientY };
        scheduleDraw();
      } else if (e.touches.length === 2 && pinchDist !== null) {
        const [t0, t1] = [e.touches[0]!, e.touches[1]!];
        const dist = Math.hypot(t0.pageX - t1.pageX, t0.pageY - t1.pageY);
        const rect = cv.getBoundingClientRect();
        applyZoom(
          (dist - pinchDist) / 5,
          (t0.clientX + t1.clientX) / 2 - rect.left,
          (t0.clientY + t1.clientY) / 2 - rect.top,
        );
        pinchDist = dist;
      }
    }

    function onTouchEnd(e: TouchEvent) {
      e.preventDefault(); // prevent synthetic mouse events after touch
      if (touchStartCanvas) commitTap(touchStartCanvas.x, touchStartCanvas.y);
      else cancelPress();
      lastTouch = null;
      pinchDist = null;
      touchStartCanvas = null;
      dragging = false;
    }

    cv.addEventListener("mousedown", onMouseDown);
    cv.addEventListener("mousemove", onMouseMove);
    cv.addEventListener("mouseup", onMouseUp);
    cv.addEventListener("mouseleave", onMouseLeave);
    cv.addEventListener("contextmenu", onContextMenu);
    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.addEventListener("touchstart", onTouchStart, { passive: true });
    cv.addEventListener("touchmove", onTouchMove, { passive: false });
    cv.addEventListener("touchend", onTouchEnd);

    return () => {
      ro.disconnect();
      cv.removeEventListener("mousedown", onMouseDown);
      cv.removeEventListener("mousemove", onMouseMove);
      cv.removeEventListener("mouseup", onMouseUp);
      cv.removeEventListener("mouseleave", onMouseLeave);
      cv.removeEventListener("contextmenu", onContextMenu);
      cv.removeEventListener("wheel", onWheel);
      cv.removeEventListener("touchstart", onTouchStart);
      cv.removeEventListener("touchmove", onTouchMove);
      cv.removeEventListener("touchend", onTouchEnd);
    };
  }, [weave, colors]);

  if (!weave) return null;

  return (
    <>
      <div className="flex flex-row text-lg">
        <button
          className="p-2 cursor-pointer"
          onClick={() => setSummaryOpen(true)}
        >
          &#128712;
        </button>
        <h2 className="my-2">{weave.name}</h2>
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
          setActiveColor={setActiveColor}
        />
      )}
      <canvas
        ref={canvasRef}
        className="bg-gray-600 grow block w-full touch-none"
      />
    </>
  );
}
