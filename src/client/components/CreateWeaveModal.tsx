import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pattern } from "@/util/pattern";
import Modal from "./Modal";
import PatternPreview from "./PatternPreview";
import { fetchColors, createWeave } from "../lib/api";
import { imageToPattern } from "../lib/image";

type Props = Pick<ComponentProps<typeof Modal>, "open" | "toggleOpen">;

export default function CreateWeaveModal({ open, toggleOpen }: Props) {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [maxColors, setMaxColors] = useState(50);
  const [imagePath, setImagePath] = useState<File | null>();
  const [pattern, setPattern] = useState<Pattern>();
  const queryClient = useQueryClient();

  const { data: colors } = useQuery({
    queryKey: ["colors"],
    queryFn: fetchColors,
    staleTime: "static",
  });

  const { mutate: create } = useMutation({
    mutationFn: createWeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weaves"] });
      toggleOpen(false);
    },
  });

  useEffect(() => {
    async function convertImage() {
      if (!imagePath || !colors) return;

      const pattern = await imageToPattern(
        imagePath,
        colors,
        width,
        height,
        maxColors,
      );
      setPattern(pattern);
    }

    convertImage();
  }, [imagePath, width, height, maxColors, setPattern, colors]);

  async function submit() {
    if (!pattern) return alert("Upload an image first");
    if (!nameRef.current?.value) return alert("Please add a name");

    create({ name: nameRef.current?.value, pattern });
  }

  const nameRef = useRef<HTMLInputElement>(null);
  const inputClass = "border rounded-lg p-2 w-full";
  return (
    <Modal open={open} toggleOpen={toggleOpen}>
      <div className="flex flex-col gap-3 min-w-64">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Name</span>
          <input ref={nameRef} type="text" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Max colors</span>
          <input
            onChange={(e) =>
              e.target.valueAsNumber > 0 && setMaxColors(e.target.valueAsNumber)
            }
            defaultValue={maxColors}
            type="number"
            min="1"
            max="10000"
            className={inputClass}
          />
        </label>
        <div className="flex gap-2">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-sm font-medium">Width</span>
            <input
              onChange={(e) =>
                e.target.valueAsNumber > 0 && setWidth(e.target.valueAsNumber)
              }
              defaultValue={width}
              type="number"
              min="1"
              max="1000"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-sm font-medium">Height</span>
            <input
              onChange={(e) =>
                e.target.valueAsNumber > 0 && setHeight(e.target.valueAsNumber)
              }
              defaultValue={height}
              type="number"
              min="1"
              max="1000"
              className={inputClass}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Image</span>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) =>
              e.target.files?.length && setImagePath(e.target.files.item(0))
            }
          />
        </label>
        {pattern ? <PatternPreview pattern={pattern} /> : null}
        <button
          className="cursor-pointer px-2 py-1 border border-(--color-foreground) rounded-lg"
          onClick={submit}
        >
          Create Weave
        </button>
      </div>
    </Modal>
  );
}
