import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useHoldProgress } from "./useHoldProgress";
import { ReactSketchCanvasRef } from "react-sketch-canvas";

const HoldToCopyButton: React.FC<{
  setCopied: (v: boolean) => void;
  canvasRef: React.RefObject<ReactSketchCanvasRef | null>;
}> = ({ setCopied, canvasRef }) => {
  const { progress, start, stop, finish } = useHoldProgress(2000);
  const downloadedRef = useRef(false);
  const TEXT = "Hold to download";

  const downloadPNG = async () => {
    if (!canvasRef.current) return;
    const dataUrl = await canvasRef.current.exportImage("png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "signature.png";
    link.click();
  };

  useEffect(() => {
    if (progress === 0) downloadedRef.current = false;
  }, [progress]);

  useEffect(() => {
    if (progress === 1 && !downloadedRef.current) {
      downloadedRef.current = true;
      setCopied(true);
      downloadPNG();
      setTimeout(() => setCopied(false), 1200);
      finish();
    }
  }, [progress, finish, setCopied]);

  return (
    <motion.button
      type="button"
      className="relative w-[180px] py-2 px-4 overflow-hidden rounded-md border border-input shadow text-sm font-medium transition-colors select-none"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}>
      {/* Green background sweep */}
      <motion.div
        className="absolute left-0 top-0 h-full bg-[#cffbdd] z-0"
        style={{ width: `${progress * 100}%` }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.1 }}
      />
      {/* Text with animated background-clip */}
      <span
        className="relative z-10 inline-block w-full text-center font-medium text-transparent"
        style={{
          backgroundImage: `linear-gradient(to right, #2e8f59 ${
            progress * 100
          }%, #222 ${progress * 100}%)`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
        }}>
        {downloadedRef.current ? "Downloaded" : TEXT}
      </span>
    </motion.button>
  );
};

export default HoldToCopyButton;
