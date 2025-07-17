import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useHoldProgress } from "./useHoldProgress";

const HoldToCopyButton: React.FC<{
  onDownload: (progress?: number | "reset") => void;
}> = ({ onDownload }) => {
  const { progress, start, stop, finish } = useHoldProgress(1200);
  const downloadedRef = useRef(false);
  const prevProgress = useRef(0);
  const TEXT = "Hold to download";

  useEffect(() => {
    if (progress === 0) downloadedRef.current = false;
  }, [progress]);

  // Animate signature as progress changes
  useEffect(() => {
    if (progress > 0 && progress < 1) {
      onDownload(progress);
    }
    if (progress === 1 && !downloadedRef.current) {
      downloadedRef.current = true;
      onDownload(undefined); // Only triggers PNG download on hold complete
      setTimeout(() => {
        downloadedRef.current = false;
      }, 1200);
      finish();
    }
    // Only reset if we were animating and now progress is 0
    if (prevProgress.current > 0 && progress === 0) {
      onDownload("reset");
    }
    prevProgress.current = progress;
  }, [progress, finish, onDownload]);

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
