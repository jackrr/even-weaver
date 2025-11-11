import { useColorMap } from "@/client/lib/colors";
// FIXME: use new pattern structure
import { type Pattern } from "@/models/weave";

type Props = {
  pattern: Pattern;
};

export default function PatternPreview({ pattern }: Props) {
  const colors = useColorMap();
  const height = Object.keys(pattern).length;
  const width = Object.keys(pattern[0]).length;
  const STITCH_SIZE = 5;
  const GAP = 1;

  return (
    <div
      className={`grid gap-${GAP} bg-gray-600`}
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
                style={{
                  backgroundColor: color,
                  width: STITCH_SIZE,
                  height: STITCH_SIZE,
                }}
                key={`cell-${y}-${x}`}
              />
            );
          })}
        </>
      ))}
    </div>
  );
}
