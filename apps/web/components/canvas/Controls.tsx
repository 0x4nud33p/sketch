"use client";

import { Pencil, Square, Circle, X, Share } from "lucide-react";
import { ControlsProps, ShapeType } from "@/types/index";
import { IconButtonWithTooltip } from "@/components/IconButtonWithTooltip";

export const Controls: React.FC<ControlsProps & { onHandleShare: () => void }> = ({
  onShapeSelect,
  onClear,
  selectedShape,
  onColorChange,
  currentColor,
  onHandleShare,
}) => {
  const tools = [
    { shape: "pencil" as ShapeType, Icon: Pencil, label: "Pencil" },
    { shape: "rectangle" as ShapeType, Icon: Square, label: "Rectangle" },
    { shape: "circle" as ShapeType, Icon: Circle, label: "Circle" },
  ];

  return (
    <div className="bg-[#18181b] flex justify-center items-center gap-4 p-2 rounded-lg shadow-lg">
      {tools.map(({ shape, Icon, label }) => (
        <IconButtonWithTooltip key={shape} label={label}>
          <button
            className={`w-10 h-10 flex justify-center items-center rounded-lg border-2 transition-all duration-300 hover:scale-110
            ${
              selectedShape === shape
                ? "bg-[#fef08a] text-black border-[#fef08a]"
                : "bg-transparent text-[#fef08a] border-[#fef08a]"
            }`}
            onClick={() => onShapeSelect(shape)}
            aria-label={label}
            aria-pressed={selectedShape === shape}
          >
            <Icon
              size={20}
              color={selectedShape === shape ? "black" : "white"}
            />
          </button>
        </IconButtonWithTooltip>
      ))}

      <IconButtonWithTooltip label="Pick Color">
        <label
          className="relative w-10 h-10 rounded-lg border-2 border-[#fef08a] cursor-pointer transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: currentColor }}
        >
          <input
            type="color"
            className="absolute opacity-0 w-full h-full"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            aria-label="Select Color"
          />
        </label>
      </IconButtonWithTooltip>

      <IconButtonWithTooltip label="Clear Canvas">
        <button
          className="w-10 h-10 flex justify-center items-center rounded-lg border-2 border-[#f87171] text-[#f87171] transition-all duration-300 hover:scale-110 hover:bg-[#f87171] hover:text-black"
          onClick={onClear}
          aria-label="Clear Canvas"
        >
          <X size={20} color="currentColor" />
        </button>
      </IconButtonWithTooltip>
      <IconButtonWithTooltip label="Share">
        <button
          className="w-10 h-10 flex justify-center items-center rounded-lg border-2 border-[#fef08a] text-[#fef08a] transition-all duration-300 hover:scale-110 hover:bg-[#fef08a] hover:text-black"
          onClick={onHandleShare}
          aria-label="Share"
        >
          <Share size={20} color="currentColor" />
        </button>
      </IconButtonWithTooltip>
    </div>
  );
};