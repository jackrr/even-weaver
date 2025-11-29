import { Fragment, useMemo, useState, type ComponentProps } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/client/components/Modal";
import {
  deleteWeave,
  updateWeave,
  type Weave,
  type Color,
} from "@/client/lib/api";
import { useColorMap } from "@/client/lib/colors";
import ConfirmationModal from "@/client/components/ConfirmationModal";

type Props = Pick<ComponentProps<typeof Modal>, "open" | "toggleOpen"> & {
  weave: Weave;
};

export default function SummaryModal({ weave, ...modalProps }: Props) {
  const navigate = useNavigate();
  const colors = useColorMap();
  const totals = useMemo(() => {
    if (!colors) return [];

    const colorCounts: {
      [id: number]: { color: Color; count: number; completed: number };
    } = {};
    for (const cell of weave.pattern.stitches) {
      const color = colors[cell[0]]!;
      const completed = cell[1] === 1;
      if (color.id in colorCounts) {
        colorCounts[color.id]!.count += 1;
        if (completed) colorCounts[color.id]!.completed += 1;
      } else {
        colorCounts[color.id] = {
          color: color,
          count: 1,
          completed: completed ? 1 : 0,
        };
      }
    }

    return Object.values(colorCounts).sort((a, b) => b.count - a.count);
  }, [weave.pattern.stitches, colors]);

  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const { mutate: startDeleteRequest } = useMutation({
    mutationFn: async () => deleteWeave(weave.id),
    onSuccess: () => {
      // TODO: confirmation banner + error handling
      queryClient.invalidateQueries({
        queryKey: ["weave", weave.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["weaves"] });
      navigate("/");
    },
  });

  const { mutate: updatePattern } = useMutation({
    mutationFn: async () => {
      const { id, name, pattern } = weave;
      return updateWeave(id, name, pattern);
    },
    onSuccess: () => {
      // TODO: confirmation banner + error handling
      queryClient.invalidateQueries({
        queryKey: ["weave", weave.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["weaves"] });
    },
  });

  function reallocate(id: number) {
    if (!colors) return;
    weave.pattern.remapToNearest(id, colors);
    updatePattern();
  }

  // IDEA: "Select alternate" deploys color picker to remap a given thread color
  return (
    <Modal {...modalProps}>
      <div className="relative grid grid-cols-[24px_minmax(40px,1fr)_50px_minmax(40px,1fr)_minmax(20px,1fr)_minmax(0,1fr)] gap-4">
        <div className="sticky -top-4 bg-white pb-2 col-span-6 grid grid-cols-subgrid pt-4">
          <div className="col-start-2">Name</div>
          <div>ID</div>
          <div className="overflow-hidden text-ellipsis">
            Stitches
            <br />
            (Completed/Total)
          </div>
          <div className="overflow-hidden text-ellipsis">
            Reallocate to nearest?
          </div>
          <div />
        </div>
        {totals.map((t, idx) => (
          <Fragment key={idx}>
            <div
              className="p-4"
              style={{ backgroundColor: `#${t.color.hex}` }}
            />
            <div className="overflow-hidden text-ellipsis">{t.color.name}</div>
            <div>{t.color.id}</div>
            <div>
              {t.completed}/{t.count}
            </div>
            <button
              className="cursor-pointer"
              onClick={() => reallocate(t.color.id)}
            >
              X
            </button>
            <div />
          </Fragment>
        ))}
      </div>
      <button className="cursor-pointer" onClick={() => setShowDelete(true)}>
        Delete!
      </button>
      <ConfirmationModal
        open={showDelete}
        toggleOpen={setShowDelete}
        confirm={startDeleteRequest}
        header="Delete this weave?"
      />
    </Modal>
  );
}
