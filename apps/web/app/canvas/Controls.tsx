import { Pencil, Square, Circle, X } from 'lucide-react';
import { controlsProps, ShapeType } from './types';

export const Controls: React.FC<controlsProps> = ({
  onShapeSelect,
  onClear,
  selectedShape,
  onColorChange,
  currentColor,
}) => {
  return (
    <div className="bg-[#18181b] flex justify-center items-center gap-4 p-4">
      {[
        { shape: 'pencil', Icon: Pencil },
        { shape: 'rectangle', Icon: Square },
        { shape: 'circle', Icon: Circle },
      ].map(({ shape, Icon }) => (
        <button
          key={shape}
          className={`w-12 h-12 flex justify-center items-center rounded-lg border-2 transition-all duration-300 hover:scale-110
          ${
            selectedShape === shape
              ? 'bg-[#fef08a] text-black border-[#fef08a]'
              : 'bg-transparent text-[#fef08a] border-[#fef08a]'
          }`}
          onClick={() => onShapeSelect(shape as ShapeType)}
        >
          <Icon size={24} color={selectedShape === shape ? 'black' : 'white'} />
        </button>
      ))}
      <label
        className="w-12 h-12 rounded-lg border-2 border-[#fef08a] cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: currentColor }}
      >
        <input
          type="color"
          className="hidden"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
        />
      </label>
      <button
        className="w-12 h-12 flex justify-center items-center rounded-lg border-2 border-[#f87171] text-[#f87171] transition-all duration-300 hover:scale-110 hover:bg-[#f87171] hover:text-black"
        onClick={onClear}
      >
        <X size={24} color="currentColor" />
      </button>
    </div>
  );
};