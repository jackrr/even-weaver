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

  return (
    <>
      {Object.entries(pattern).map(([y, row]) => (
        <div key={`row-${y}`}>
          {Object.entries(row).map(([x, cell]) => {
            const color = colors ? colors[cell.c]?.hex : null;
            // FIXME: figure out how to set color
            // TODO: finish visual preview
            return <div key={`cell-${y}-${x}`}>{JSON.stringify(cell)}</div>;
          })}
        </div>
      ))}
    </>
  );
}
