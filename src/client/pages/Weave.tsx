import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchWeave, updateWeave } from "@/client/lib/api";
import { useColorMap } from "@/client/lib/colors";
import { usePageTitle } from "@/client/lib/title";

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
      if (!(y in pattern)) return;
      if (!(x in pattern[y])) return;

      pattern[y][x].s = pattern[y][x].s === "todo" ? "done" : "todo";

      return updateWeave(id, name, pattern);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weave", id] });
    },
  });

  usePageTitle(weave?.name);

  if (!weave) return null;

  // FIXME: use new pattern structure

  const { pattern, name } = weave;

  const height = Object.keys(pattern).length;
  const width = Object.keys(pattern[0]).length;
  const STITCH_SIZE = 20;
  const GAP = 5;

  // TODO: click+drag to pan (or touch+drag)
  // TODO: zoom: pinch, double tap, ctrl + scroll
  return (
    <div
      className={`grid gap-${GAP} bg-gray-600 overflow-hidden`}
      style={{
        gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
        height: height * (STITCH_SIZE + GAP),
        width: width * (STITCH_SIZE + GAP),
      }}
    >
      {Object.entries(pattern).map(([y, row]) => (
        <>
          {Object.entries(row).map(([x, cell]) => {
            const color = colors ? `#${colors[cell.c]?.hex}` : "";
            return (
              <div
                className="flex content-center justify-center"
                style={{
                  backgroundColor: color,
                  width: STITCH_SIZE,
                  height: STITCH_SIZE,
                }}
                key={`cell-${y}-${x}`}
                onClick={() => toggleCellCompletion({ x, y })}
              >
                {cell.s === "done" ? (
                  <div className="text-xl/5 text-gray-100 bg-black opacity-40 w-full h-full">
                    ✓
                  </div>
                ) : null}
              </div>
            );
          })}
        </>
      ))}
    </div>
  );
}
