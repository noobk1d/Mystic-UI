import { useRef, useEffect, useState } from "react";

export function useHoldProgress(duration = 2000) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdingRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  function animate(now: number) {
    if (!holdingRef.current || startRef.current === null) return;
    const elapsed = now - startRef.current;
    const nextProgress = Math.min(elapsed / duration, 1);
    setProgress(nextProgress);
    if (nextProgress < 1) {
      frame.current = requestAnimationFrame(animate);
    }
  }

  const start = () => {
    setHolding(true);
    holdingRef.current = true;
    startRef.current = performance.now();
    frame.current = requestAnimationFrame(animate);
  };
  const stop = () => {
    setHolding(false);
    holdingRef.current = false;
    setProgress(0);
    startRef.current = null;
    if (frame.current) cancelAnimationFrame(frame.current);
  };
  const finish = () => {
    setHolding(false);
    holdingRef.current = false;
    setProgress(1);
    startRef.current = null;
    if (frame.current) cancelAnimationFrame(frame.current);
  };

  useEffect(() => {
    if (!holdingRef.current && progress > 0 && progress < 1) {
      setProgress(0);
    }
  }, [progress]);

  return { progress, holding, start, stop, finish };
}
