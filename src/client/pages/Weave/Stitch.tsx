import { Status } from "@/util/pattern";
import LongPressable from "@/client/components/LongPressable";

type Props = {
  status: Status;
  color: string;
  select: () => void;
  toggleComplete: () => void;
  size: number;
  inactive: boolean;
};

export default function Stitch({
  status,
  color,
  select,
  toggleComplete,
  size,
  inactive,
}: Props) {
  // FIXME: right click/long press break after one or two modal opens
  return (
    <LongPressable
      threshold={200}
      onLongPress={select}
      className="flex content-center justify-center cursor-pointer"
      style={{
        backgroundColor: color,
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
            background: `repeating-linear-gradient(-45deg, transparent, transparent ${size / 8}px, #333 ${size / 8}px, #333 ${size / 4}px)`,
          }}
        />
      ) : null}
    </LongPressable>
  );
}
