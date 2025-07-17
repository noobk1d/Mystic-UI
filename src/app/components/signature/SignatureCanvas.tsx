"use client";

import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import getStroke from "perfect-freehand";
import { useSignatureDrawProgress } from "./useSignatureDrawProgress";

function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";
  const d = stroke.map(([x, y], i) =>
    i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  );
  return d.join(" ");
}

// Helper: check if two line segments (p1-p2 and q1-q2) intersect
function segmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  q1: [number, number],
  q2: [number, number]
): boolean {
  function ccw(a: [number, number], b: [number, number], c: [number, number]) {
    return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  }
  return (
    ccw(p1, q1, q2) !== ccw(p2, q1, q2) && ccw(p1, p2, q1) !== ccw(p1, p2, q2)
  );
}

// Helper: distance between two points
function dist(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

// Helper: split a stroke at all intersections with eraser path (radius)
function splitStrokeByEraser(
  stroke: [number, number][],
  eraserPath: [number, number][],
  eraserRadius = 3
): [number, number][][] {
  if (stroke.length < 2 || eraserPath.length < 2) return [stroke];
  const segments: [number, number][][] = [];
  let current: [number, number][] = [];
  let i = 0;
  while (i < stroke.length - 1) {
    const p1 = stroke[i];
    const p2 = stroke[i + 1];
    let erased = false;
    // Check for intersection with eraser path (as thick lines)
    for (let j = 0; j < eraserPath.length - 1; j++) {
      const q1 = eraserPath[j];
      const q2 = eraserPath[j + 1];
      // If segments are close enough, treat as intersection
      if (
        dist(p1, q1) < eraserRadius ||
        dist(p2, q2) < eraserRadius ||
        dist(p1, q2) < eraserRadius ||
        dist(p2, q1) < eraserRadius
      ) {
        erased = true;
        break;
      }
      if (segmentsIntersect(p1, p2, q1, q2)) {
        erased = true;
        break;
      }
    }
    if (!erased) {
      if (current.length === 0) current.push(p1);
      current.push(p2);
    } else {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    i++;
  }
  if (current.length > 1) segments.push(current);
  return segments;
}

// Helper: get centerline SVG path from points
function getCenterlinePath(points: [number, number][]) {
  if (!points.length) return "";
  return points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(" ");
}

// Multi-color stroke type
interface Stroke {
  points: [number, number][];
  color: string;
  strokeWidth: number;
}

export interface SignatureCanvasHandle {
  clear: () => void;
  exportAsPng: () => string | null;
}

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  eraserMode?: boolean;
  drawProgress?: number; // 0-1, for draw-on animation
}

const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  (
    {
      width = 400,
      height = 150,
      strokeWidth = 2,
      color = "#000",
      eraserMode = false,
      drawProgress,
    },
    ref
  ) => {
    const [points, setPoints] = useState<[number, number][]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [eraserPoints, setEraserPoints] = useState<[number, number][]>([]);
    const svgRef = useRef<SVGSVGElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

    // For draw-on animation
    useSignatureDrawProgress(strokes, drawProgress ?? 1);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (eraserMode) {
        setEraserPoints([[e.nativeEvent.offsetX, e.nativeEvent.offsetY]]);
      } else {
        setPoints([[e.nativeEvent.offsetX, e.nativeEvent.offsetY]]);
      }
      (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (e.buttons !== 1) return;
      if (eraserMode) {
        setEraserPoints((pts: [number, number][]) => {
          const newPts: [number, number][] = [
            ...pts,
            [e.nativeEvent.offsetX, e.nativeEvent.offsetY],
          ];
          // Instant erasing: as soon as eraser path has 2+ points, erase
          if (newPts.length > 1) {
            setStrokes((prevStrokes) => {
              const newStrokes: Stroke[] = [];
              for (const stroke of prevStrokes) {
                const split = splitStrokeByEraser(stroke.points, newPts, 2);
                for (const seg of split) {
                  if (seg.length > 1)
                    newStrokes.push({ ...stroke, points: seg });
                }
              }
              return newStrokes;
            });
          }
          return newPts;
        });
      } else {
        setPoints((pts) => [
          ...pts,
          [e.nativeEvent.offsetX, e.nativeEvent.offsetY],
        ]);
      }
    };

    const handlePointerUp = () => {
      if (eraserMode) {
        if (eraserPoints.length > 1) {
          // Already handled in pointer move
          setEraserPoints([] as [number, number][]);
        }
      } else {
        if (points.length) {
          setStrokes((all) => [...all, { points, color, strokeWidth }]);
          setPoints([]);
        }
      }
    };

    // Expose clear and exportAsPng methods to parent
    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          setStrokes([]);
          setPoints([]);
          setEraserPoints([]);
        },
        exportAsPng: () => {
          if (!hiddenCanvasRef.current) return null;
          const ctx = hiddenCanvasRef.current.getContext("2d");
          if (!ctx) return null;
          // Clear
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, width, height);
          // Draw all strokes
          for (const stroke of strokes) {
            ctx.strokeStyle = stroke.color;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = stroke.strokeWidth;
            const outline = getStroke(stroke.points, {
              size: stroke.strokeWidth,
            });
            if (outline.length > 0) {
              ctx.beginPath();
              ctx.moveTo(outline[0][0], outline[0][1]);
              for (let i = 1; i < outline.length; i++) {
                ctx.lineTo(outline[i][0], outline[i][1]);
              }
              ctx.stroke();
            }
          }
          // Draw current points if any
          if (points.length > 0) {
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = strokeWidth;
            const outline = getStroke(points, { size: strokeWidth });
            if (outline.length > 0) {
              ctx.beginPath();
              ctx.moveTo(outline[0][0], outline[0][1]);
              for (let i = 1; i < outline.length; i++) {
                ctx.lineTo(outline[i][0], outline[i][1]);
              }
              ctx.stroke();
            }
          }
          return hiddenCanvasRef.current.toDataURL("image/png");
        },
      }),
      [strokes, points, width, height, color, strokeWidth]
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width,
        }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
            touchAction: "none",
            display: "block",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}>
          {drawProgress === undefined ? (
            // Not animating: show all strokes in their original color (full outline)
            strokes.map((stroke, i) => (
              <path
                key={i}
                d={getSvgPathFromStroke(
                  getStroke(stroke.points, { size: stroke.strokeWidth })
                )}
                fill="none"
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))
          ) : (
            // Animating: show all strokes in light grey as base, then overlay animated colored centerlines
            <>
              {strokes.map((stroke, i) => (
                <path
                  key={"grey-" + i}
                  d={getSvgPathFromStroke(
                    getStroke(stroke.points, { size: stroke.strokeWidth })
                  )}
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth={stroke.strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
              {strokes.map((stroke, i) => {
                // Animate centerline in color
                const centerline = getCenterlinePath(stroke.points);
                const totalLength = stroke.points.reduce(
                  (acc, pt, idx, arr) => {
                    if (idx === 0) return 0;
                    const [x1, y1] = arr[idx - 1];
                    const [x2, y2] = pt;
                    return acc + Math.hypot(x2 - x1, y2 - y1);
                  },
                  0
                );
                const revealLength = totalLength * (drawProgress ?? 1);
                return (
                  <path
                    key={"center-anim-" + i}
                    d={centerline}
                    fill="none"
                    stroke={stroke.color}
                    strokeWidth={stroke.strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray={totalLength}
                    strokeDashoffset={totalLength - revealLength}
                  />
                );
              })}
            </>
          )}
          {points.length > 0 && !eraserMode && (
            <path
              d={getSvgPathFromStroke(getStroke(points, { size: strokeWidth }))}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {eraserPoints.length > 0 && eraserMode && (
            <path
              d={getSvgPathFromStroke(eraserPoints)}
              fill="none"
              stroke="#ff4d4f"
              strokeWidth={4}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.5}
              style={{ pointerEvents: "none" }}
            />
          )}
        </svg>
        {/* Hidden canvas for PNG export */}
        <canvas
          ref={hiddenCanvasRef}
          width={width}
          height={height}
          style={{ display: "none" }}
        />
      </div>
    );
  }
);

SignatureCanvas.displayName = "SignatureCanvas";

export default SignatureCanvas;
