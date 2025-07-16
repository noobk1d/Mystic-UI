import React, { useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Black", value: "#222" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Red", value: "#ef4444" },
];

export interface ConfigMenuProps {
  open: boolean;
  onClose: () => void;
  strokeWidth: number;
  setStrokeWidth: (v: number) => void;
  color: string;
  setColor: (v: string) => void;
  onReset: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export const ConfigMenu: React.FC<ConfigMenuProps> = ({
  open,
  onClose,
  strokeWidth,
  setStrokeWidth,
  color,
  setColor,
  onReset,
  anchorRef,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose, anchorRef]);

  if (!open) return null;
  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute z-30 min-w-[270px] w-full rounded-b-md border border-neutral-800 bg-[#232323] shadow-xl text-white flex flex-col gap-0 p-0 border-t",
        "left-0"
      )}
      style={{ top: "100%", borderTopColor: "#ececec" }}>
      {/* Header */}

      {/* Section: Hot Spots (static label for now) */}
      <div className="px-4 pt-3 pb-1 text-xs text-neutral-400 font-semibold tracking-wide select-none">
        hot spots
      </div>
      {/* Divider */}
      <div className="border-b border-neutral-800 mx-4" />
      {/* Stroke Width Slider */}
      <div className="flex items-center px-4 py-2 gap-3">
        <div className="flex-1">
          <div className="text-xs text-neutral-300 mb-1 select-none">
            stroke width
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={10}
              step={0.01}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full h-1 bg-neutral-700 rounded appearance-none outline-none slider-thumb"
              style={{ accentColor: "#fff" }}
            />
          </div>
        </div>
        <span className="w-16 text-center text-xs font-mono bg-neutral-900 rounded px-2 py-1 ml-2 border border-neutral-800 flex-shrink-0 flex items-center justify-center">
          {strokeWidth.toFixed(2)}
        </span>
      </div>
      {/* Color Selector */}
      <div className="flex items-center px-4 py-2 gap-2">
        <div className="text-xs text-neutral-300 select-none">color</div>
        <div className="flex gap-1 ml-1">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none",
                color === c.value
                  ? "border-white scale-110"
                  : "border-neutral-700 opacity-80 hover:opacity-100"
              )}
              style={{ background: c.value }}
              aria-label={c.name}
            />
          ))}
        </div>
        <span className="w-16 text-center text-xs font-mono bg-neutral-900 rounded px-2 py-1 ml-2 border border-neutral-800 flex-shrink-0 flex items-center justify-center">
          {color === "#222"
            ? "Black"
            : color === "#2563eb"
            ? "Blue"
            : color === "#22c55e"
            ? "Green"
            : color === "#eab308"
            ? "Yellow"
            : color === "#ef4444"
            ? "Red"
            : ""}
        </span>
      </div>
      {/* Divider */}
      <div className="border-b border-neutral-800 mx-4" />

      {/* Reset Button */}
      <div className="px-4 pb-3 pt-2">
        <Button
          className="w-full text-center py-1 text-xs rounded"
          onClick={onReset}
          type="button">
          reset signature
        </Button>
      </div>
      <style jsx global>{`
        input[type="range"].slider-thumb::-webkit-slider-thumb {
          width: 16px;
          height: 8px;
          border-radius: 3px;
          background: #fff;
          border: 1px solid #bbb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
          transition: background 0.2s;
        }
        input[type="range"].slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 8px;
          border-radius: 3px;
          background: #fff;
          border: 1px solid #bbb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
          transition: background 0.2s;
        }
        input[type="range"].slider-thumb::-ms-thumb {
          width: 16px;
          height: 8px;
          border-radius: 3px;
          background: #fff;
          border: 1px solid #bbb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
          transition: background 0.2s;
        }
      `}</style>
    </div>
  );
};
