import { useMemo } from "react";
import Modal from "@/client/components/Modal";
import { useColorMap } from "@/client/lib/colors";
import type { Weave } from "@/client/lib/api";

type Props = {
  cell: [number, number];
  close: () => void;
  weave: Weave;
  activeColor?: number;
  setActiveColor: (id: number | undefined) => void;
};

export default function DetailsModal({
  cell,
  close,
  weave,
  activeColor,
  setActiveColor,
}: Props) {
  // Thread name and number
  const colors = useColorMap();
  const color = useMemo(() => {
    if (!colors) return;
    const stitch = weave.pattern.getStitch(cell[0], cell[1]);
    return colors[stitch[0]]!;
  }, [weave.pattern, colors]);

  function toggleActiveColor() {
    if (!color) return;
    setActiveColor(activeColor !== color.id ? color.id : undefined);
  }

  return (
    <Modal open={true} toggleOpen={close}>
      {color && (
        <div className="flex content-center justify-start gap-4">
          <div className="p-4" style={{ backgroundColor: `#${color.hex}` }} />
          <div>{color.name}</div>
          <div>{color.key}</div>
        </div>
      )}
      <div>x: {cell[0]}</div>
      <div>y: {cell[1]}</div>
      <button className="cursor-pointer" onClick={toggleActiveColor}>
        Toggle Color Highlight
      </button>
    </Modal>
  );
}
