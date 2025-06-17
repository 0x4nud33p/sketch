import React from "react";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <>
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full flex items-center justify-center shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full flex items-center justify-center shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          -
        </button>
        <button
          onClick={onResetZoom}
          className="w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-full flex items-center justify-center shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          title="Reset Zoom"
          aria-label="Reset Zoom"
        >
          ⌂
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-20 bg-black/70 text-white px-3 py-2 rounded text-sm font-medium backdrop-blur-sm">
        {Math.round(zoomLevel * 100)}%
      </div>
    </>
  );
};
