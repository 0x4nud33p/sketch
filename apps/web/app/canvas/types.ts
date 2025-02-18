export type ControlsProps = {
 onShapeSelect: (shape: ShapeType) => void;
 onClear: () => void;
 selectedShape: ShapeType;
 onColorChange: (color: string) => void;
 currentColor: string;
};

export type ShapeType = 'pencil' | 'circle' | 'rectangle';