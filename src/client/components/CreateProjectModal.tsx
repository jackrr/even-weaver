import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Pattern } from "@/models/weave";
import Modal from "./Modal";
import { fetchColors } from "../lib/api";
import { imageToPattern } from "../lib/image";

type Props = Pick<ComponentProps<typeof Modal>, "open" | "toggleOpen">;

export default function CreateProjectModal({ open, toggleOpen }: Props) {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [imagePath, setImagePath] = useState<File | null>();
  const [pattern, setPattern] = useState<Pattern>();

  const { data: colors } = useQuery({
    queryKey: ["colors"],
    queryFn: fetchColors,
    staleTime: "static",
  });

  useEffect(() => {
    async function convertImage() {
      if (!imagePath || !colors) return;

      const pattern = await imageToPattern(imagePath, colors, width, height);
      setPattern(pattern);
    }

    convertImage();
  }, [imagePath, width, height, setPattern, colors]);

  // TODO: pattern visual preview
  // TODO: form submission to backend via button if name and pattern are established
  const nameRef = useRef<HTMLInputElement>(null);
  return (
    <Modal open={open} toggleOpen={toggleOpen}>
      <input ref={nameRef} type="text" />
      <input
        onChange={(e) => setWidth(e.target.valueAsNumber)}
        defaultValue={width}
        type="number"
        min="1"
        max="1000"
      />
      <input
        onChange={(e) => setHeight(e.target.valueAsNumber)}
        defaultValue={height}
        type="number"
        min="1"
        max="1000"
      />
      <input
        type="file"
        onChange={(e) =>
          e.target.files?.length && setImagePath(e.target.files.item(0))
        }
      />
    </Modal>
  );
}
