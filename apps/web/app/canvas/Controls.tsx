"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Pencil, Square, Circle, X } from "lucide-react";
import { ControlsProps, ShapeType } from "./types";

const IconButtonWithTooltip = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Tooltip.Provider delayDuration={100}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-white text-black text-xs font-medium px-2 py-1 rounded shadow-lg z-50"
          side="top"
          sideOffset={8}
        >
          {label}
          <Tooltip.Arrow className="fill-white" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export const Controls: React.FC<ControlsProps> = ({
  onShapeSelect,
  onClear,
  selectedShape,
  onColorChange,
  currentColor,
}) => {
  return (
    <div className="bg-[#18181b] flex justify-center items-center gap-4 p-4 z-10">
      {[
        { shape: "pencil", Icon: Pencil, label: "Pencil" },
        { shape: "rectangle", Icon: Square, label: "Rectangle" },
        { shape: "circle", Icon: Circle, label: "Circle" },
      ].map(({ shape, Icon, label }) => (
        <IconButtonWithTooltip key={shape} label={label}>
          <button
            className={`w-12 h-12 flex justify-center items-center rounded-lg border-2 transition-all duration-300 hover:scale-110
            ${
              selectedShape === shape
                ? "bg-[#fef08a] text-black border-[#fef08a]"
                : "bg-transparent text-[#fef08a] border-[#fef08a]"
            }`}
            onClick={() => onShapeSelect(shape as ShapeType)}
          >
            <Icon
              size={24}
              color={selectedShape === shape ? "black" : "white"}
            />
          </button>
        </IconButtonWithTooltip>
      ))}

      <IconButtonWithTooltip label="Pick Color">
        <label
          className="relative w-12 h-12 rounded-lg border-2 border-[#fef08a] cursor-pointer transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: currentColor }}
        >
          <input
            type="color"
            className="absolute opacity-0 w-full h-full"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>
      </IconButtonWithTooltip>

      <IconButtonWithTooltip label="Clear Canvas">
        <button
          className="w-12 h-12 flex justify-center items-center rounded-lg border-2 border-[#f87171] text-[#f87171] transition-all duration-300 hover:scale-110 hover:bg-[#f87171] hover:text-black"
          onClick={onClear}
        >
          <X size={24} color="currentColor" />
        </button>
      </IconButtonWithTooltip>
    </div>
  );
};
