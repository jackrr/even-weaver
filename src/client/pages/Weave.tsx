import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchWeave, updateWeave } from "@/client/lib/api";
import { useColorMap } from "@/client/lib/colors";
import { usePageTitle } from "@/client/lib/title";
import {
  useRef,
  useState,
  type DragEventHandler,
  type WheelEventHandler,
} from "react";

const BASE_STITCH = 4;
const BASE_GAP = 1;
const DEFAULT_ZOOM = 4;

export default function Weave() {
  const { id } = useParams();
  const colors = useColorMap();
  const queryClient = useQueryClient();
  const { data: weave } = useQuery({
    queryKey: ["weave", id],
    queryFn: () => fetchWeave(id),
    enabled: !!id,
  });

  const { mutate: toggleCellCompletion } = useMutation({
    mutationFn: async ({ x, y }: { x: number; y: number }) => {
      if (!id) return;
      pattern.toggleStitch(x, y);
      return updateWeave(id, name, pattern);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weave", id] });
    },
  });

  usePageTitle(weave?.name);

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  function zoomIn() {
    setZoom(zoom * 2);
  }
  function zoomOut() {
    setZoom(zoom / 2);
  }

  const gridRef = useRef<HTMLDivElement>(null);
  const lastDragCoord = useRef<[number, number]>(null);

  if (!weave) return null;

  const onMove: DragEventHandler<HTMLDivElement> = function (e) {
    if (!lastDragCoord.current) return;
    if (!gridRef.current) return;

    const [prevX, prevY] = lastDragCoord.current;
    const { clientX: newX, clientY: newY } = e;
    const dx = prevX - newX;
    const dy = prevY - newY;

    gridRef.current.scrollBy(dx, dy);
    lastDragCoord.current = [newX, newY];
  };

  const onDragStart: DragEventHandler<HTMLDivElement> = function (e) {
    lastDragCoord.current = [e.clientX, e.clientY];
    // Prevent "ghost" image
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const onDragEnd: DragEventHandler<HTMLDivElement> = function () {
    lastDragCoord.current = null;
  };

  const onMouseWheel: WheelEventHandler<HTMLDivElement> = function (e) {
    if (!gridRef.current) return;
    if (e.shiftKey) {
      // zoom
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY > 0) zoomOut();
      if (e.deltaY < 0) zoomIn();
    } else {
      // pan it
      gridRef.current.scrollBy(e.deltaX, e.deltaY);
    }
  };

  const { pattern, name } = weave;
  const { width, height } = pattern;
  const STITCH_SIZE = BASE_STITCH * zoom;
  const GAP = BASE_GAP * zoom;

  // TODO: pinch to zoom https://stackoverflow.com/a/11183333/4914489
  // FIXME: zoom should happen around interaction point
  // TODO: long press cell trigger info popup
  // TODO: global summary (color mapping to names with totals, % complete) - can show in modal
  return (
    <>
      <h2>{name}</h2>
      <div
        className={`bg-gray-600 overflow-hidden grow`}
        onDragOver={onMove}
        ref={gridRef}
        onDoubleClick={zoomIn}
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
