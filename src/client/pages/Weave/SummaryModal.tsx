import { useMemo, type ComponentProps } from "react";
import Modal from "@/client/components/Modal";
import type { Weave, Color } from "@/client/lib/api";
import { useColorMap } from "@/client/lib/colors";

type Props = Pick<ComponentProps<typeof Modal>, "open" | "toggleOpen"> & {
  weave: Weave;
};

export default function SummaryModal({ weave, ...modalProps }: Props) {
  const colors = useColorMap();
  const totals = useMemo(() => {
    if (!colors) return [];

    const colorCounts: { [id: number]: { color: Color; count: number } } = {};
    for (const cell of weave.pattern.stitches) {
      const color = colors[cell[0]]!;
      if (color.id in colorCounts) {
        colorCounts[color.id]!.count += 1;
      } else {
        colorCounts[color.id] = {
          color: color,
          count: 1,
        };
      }
    }

    return Object.values(colorCounts).sort((a, b) => a.count - b.count);
  }, [weave.pattern.stitches, colors]);
  return (
    <Modal {...modalProps}>
      <ul>
        <li className="flex content-center justify-start gap-4">
          <div className="p-4" />
          <div className="w-50">Name</div>
          <div className="w-20">ID</div>
          <div className="w-30">Stitch Count</div>
        </li>
        {totals.map((t, idx) => (
          <li key={idx} className="flex content-center justify-start gap-4">
            <div
              className="p-4"
              style={{ backgroundColor: `#${t.color.hex}` }}
            />
            <div className="w-50">{t.color.name}</div>
            <div className="w-20">{t.color.id}</div>
            <div className="w-30">{t.count}</div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
