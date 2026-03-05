"use client";

import { ActionButton } from "@/lib/types";

interface ActionButtonsProps {
  buttons: ActionButton[];
  onSelect: (value: string) => void;
  disabled: boolean;
}

export default function ActionButtons({
  buttons,
  onSelect,
  disabled,
}: ActionButtonsProps) {
  const variantStyles: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-sky-dark to-sky-primary text-white hover:from-sky-darker hover:to-sky-dark border-sky-primary shadow-sm shadow-sky-primary/20",
    danger:
      "bg-white text-red-600 hover:bg-red-50 border-red-300",
    secondary:
      "bg-white text-sky-darker hover:bg-sky-bg border-sky-200",
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(btn.value)}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
            variantStyles[btn.variant || "secondary"]
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
