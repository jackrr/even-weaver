import { useColorMap } from "@/client/lib/colors";
import { Pattern } from "@/util/pattern";

type Props = {
  pattern: Pattern;
};

export default function PatternPreview({ pattern }: Props) {
  const colors = useColorMap();
  const { width, height } = pattern;
  const STITCH_SIZE = 5;
  const GAP = 1;

  return (
    <div
      className="grid bg-gray-600"
      style={{
        gridTemplateColumns: `repeat(${width}, ${STITCH_SIZE}px)`,
        gap: GAP,
        height: height * (STITCH_SIZE + GAP),
        width: width * (STITCH_SIZE + GAP),
      }}
    >
      {pattern.mapStitches(({ stitch, x, y }) => {
        const color = colors ? `#${colors[stitch[0]]?.hex}` : "";
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
    </div>
  );
}
