import { useEffect, useRef } from "react";
import { useColorMap } from "@/client/lib/colors";
import { Pattern } from "@/util/pattern";

type Props = {
  pattern: Pattern;
};

const STITCH_SIZE = 5;
const GAP = 1;
const CELL_SIZE = STITCH_SIZE + GAP;

export default function PatternPreview({ pattern }: Props) {
  const colors = useColorMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !colors) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pattern.eachStitch(({ stitch, x, y }) => {
      const color = colors[stitch[0]];
      if (!color) return;
      ctx.fillStyle = `#${color.hex}`;
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, STITCH_SIZE, STITCH_SIZE);
    });
  }, [pattern, colors]);

  return (
    <canvas
      ref={canvasRef}
      width={pattern.width * CELL_SIZE}
      height={pattern.height * CELL_SIZE}
      className="bg-gray-600"
    />
  );
}
