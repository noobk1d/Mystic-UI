import { useMemo } from "react";
import getStroke from "perfect-freehand";

// Stroke type for multi-color support
export interface Stroke {
  points: [number, number][];
  color: string;
  strokeWidth: number;
}

// Helper to get SVG path and length for a stroke
function getSvgPathAndLength(stroke: Stroke) {
  const outline = getStroke(stroke.points, { size: stroke.strokeWidth });
  if (!outline.length) return { d: "", length: 0 };
  let d = "";
  let length = 0;
  for (let i = 0; i < outline.length; i++) {
    const [x, y] = outline[i];
    if (i === 0) {
      d += `M ${x} ${y}`;
    } else {
      d += ` L ${x} ${y}`;
      const [px, py] = outline[i - 1];
      length += Math.hypot(x - px, y - py);
    }
  }
  return { d, length };
}

// Hook: returns an array of { d, color, strokeWidth, dasharray, dashoffset } for draw-on animation
export function useSignatureDrawProgress(strokes: Stroke[], progress: number) {
  return useMemo(() => {
    // Compute total length
    const paths = strokes.map(getSvgPathAndLength);
    const totalLength = paths.reduce((sum, p) => sum + p.length, 0);
    const revealLength = totalLength * progress;
    // Figure out how much of each stroke to reveal
    let acc = 0;
    return strokes.map((stroke, i) => {
      const { d, length } = paths[i];
      const dasharray = length;
      let dashoffset = length;
      if (acc + length < revealLength) {
        // Fully revealed
        dashoffset = 0;
      } else if (acc < revealLength) {
        // Partially revealed
        dashoffset = length - (revealLength - acc);
      }
      acc += length;
      return {
        d,
        color: stroke.color,
        strokeWidth: stroke.strokeWidth,
        dasharray,
        dashoffset,
      };
    });
  }, [strokes, progress]);
}
