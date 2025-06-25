"use client";

import Canvas from "@/components/canvas/Canvas";
import { Suspense } from 'react';

const DrawingPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Canvas />
    </Suspense>
  );
};

export default DrawingPage;
