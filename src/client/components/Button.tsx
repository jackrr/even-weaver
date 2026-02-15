import type { ReactNode } from "react";

export default function Button({
  onClick,
  className,
  children,
  disabled,
}: {
  className?: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`cursor-pointer px-2 py-1 border border-(--color-foreground) rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
