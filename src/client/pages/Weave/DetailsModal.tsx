import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "@/client/components/Modal";

type Props = {
  cell: number;
  close: () => void;
};

export default function DetailsModal({ cell, close }: Props) {
  // TODO: color detail info
  return (
    <Modal open={true} toggleOpen={close}>
      Cell {cell}
    </Modal>
  );
}
