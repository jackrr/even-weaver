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
  // TODO: better completion UI
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
    >
      {status === Status.DONE ? (
        <div
          className=" text-gray-100 bg-green-700 w-full h-full"
          style={{
            fontSize: size,
            paddingLeft: size / 16,
            lineHeight: "100%",
          }}
        >
          ✓
        </div>
      ) : null}
    </LongPressable>
  );
}
