import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "@/client/components/Modal";

type Props = Pick<ComponentProps<typeof Modal>, "open" | "toggleOpen">;

export default function SummaryModal(props: Props) {
  return <Modal {...props}>Hello!</Modal>;
}
