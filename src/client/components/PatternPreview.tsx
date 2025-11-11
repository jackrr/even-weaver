import { useQuery } from "@tanstack/react-query";
import { type Pattern } from "@/models/weave";
import { fetchColors, type Color } from "../lib/api";

type Props = {
  pattern: Pattern;
};

export default function PatternPreview({ pattern }: Props) {
  const { data: colors } = useQuery({
    queryKey: ["colors"],
    queryFn: fetchColors,
    staleTime: "static",
    select: (colors) => {
      const colorMap: { [id: number]: Color } = {};
      return colors.reduce((colorMap, color) => {
        colorMap[color.id] = color;
        return colorMap;
      }, colorMap);
    },
  });

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
