import { Status } from "@/util/pattern";
import LongPressable from "@/client/components/LongPressable";
import { type Color } from "@/client/lib/api";

type Props = {
  status: Status;
  color: Color;
  select: () => void;
  toggleComplete: () => void;
  size: number;
  inactive: boolean;
};

function completeColor(color: Color) {
  if (color.r + color.g + color.b > 300) {
    return "333";
  } else {
    return "888";
  }
}

export default function Stitch({
  status,
  color,
  select,
  toggleComplete,
  size,
  inactive,
}: Props) {
  const completeContrast = completeColor(color);
  return (
    <LongPressable
      threshold={200}
      onLongPress={select}
      className="flex content-center justify-center cursor-pointer z-10"
      style={{
        backgroundColor: `#${color.hex}`,
        width: size,
        height: size,
        opacity: inactive ? 0.1 : 1,
      }}
      onClick={toggleComplete}
      onContextMenu={(e) => {
        e.preventDefault();
        select();
      }}
    >
      {status === Status.DONE ? (
        <div
          className="w-full h-full"
          style={{
            background: `repeating-linear-gradient(-45deg, transparent, transparent ${size / 6}px, #${completeContrast} ${size / 6}px, #${completeContrast} ${size / 3}px)`,
          }}
        />
      ) : null}
    </LongPressable>
  );
}
