import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import React from "react";

type SignatureCanvasProps = {
  canvasRef: React.RefObject<ReactSketchCanvasRef | null>;
  strokeWidth: number;
  color: string;
};

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  canvasRef,
  strokeWidth,
  color,
}) => {
  return (
    <ReactSketchCanvas
      ref={canvasRef}
      style={{ borderRadius: 12, position: "relative", zIndex: 1 }}
      width="400px"
      height="150px"
      strokeWidth={strokeWidth}
      strokeColor={color}
      canvasColor="#fff"
    />
  );
};

export default SignatureCanvas;
