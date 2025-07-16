"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { BorderBeam } from "@/app/components/ui/border-beam";
import SignatureCanvas from "./SignatureCanvas";
import HoldToCopyButton from "./HoldToCopyButton";
import { ReactSketchCanvasRef } from "react-sketch-canvas";

export function BorderCard({
  strokeWidth = 4,
  color = "#222",
}: {
  strokeWidth?: number;
  color?: string;
}) {
  const canvasRef = useRef<ReactSketchCanvasRef | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLayoutReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <Card className="relative w-[500px] overflow-hidden py-2">
      <CardHeader className="px-3">
        <div className="flex items-center gap-1">
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="#6c6c6c">
            <path
              d="M.75,17.5A.751.751,0,0,1,0,16.75V12.569a.755.755,0,0,1,.22-.53L11.461.8a2.72,2.72,0,0,1,3.848,0L16.7,2.191a2.72,2.72,0,0,1,0,3.848L5.462,17.28a.747.747,0,0,1-.531.22ZM1.5,12.879V16h3.12l7.91-7.91L9.41,4.97ZM13.591,7.03l2.051-2.051a1.223,1.223,0,0,0,0-1.727L14.249,1.858a1.222,1.222,0,0,0-1.727,0L10.47,3.91Z"
              transform="translate(3.25 3.25)"
              fill="#6c6c6c"
            />
          </svg>
          <CardTitle>Draw Signature</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        <div className="w-full flex items-center justify-center relative">
          {layoutReady && (
            <SignatureCanvas
              canvasRef={canvasRef}
              strokeWidth={strokeWidth}
              color={color}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-3">
        <div className="flex gap-2">
          {/* Eraser Button */}
          <Button
            variant="none"
            type="button"
            onClick={() => {
              if (canvasRef.current) {
                canvasRef.current.eraseMode(true);
              }
            }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5">
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.0828 19.0632C12.6389 19.5072 12.2399 19.9062 11.8725 20.25H21C21.4142 20.25 21.75 20.5858 21.75 21C21.75 21.4142 21.4142 21.75 21 21.75H9C8.98166 21.75 8.96347 21.7493 8.94546 21.748C8.24156 21.7211 7.64439 21.4169 7.05863 20.97C6.47124 20.5218 5.81539 19.866 5.01269 19.0632L4.93674 18.9873C4.13402 18.1846 3.47815 17.5288 3.03 16.9414C2.56159 16.3274 2.25 15.701 2.25 14.9522C2.25 14.2035 2.56159 13.577 3.03 12.9631C3.47816 12.3757 4.13402 11.7199 4.93674 10.9172L10.9172 4.93674C11.7199 4.13403 12.3757 3.47815 12.9631 3.03C13.577 2.56159 14.2035 2.25 14.9522 2.25C15.701 2.25 16.3274 2.56159 16.9414 3.03C17.5288 3.47816 18.1846 4.13402 18.9873 4.93674L19.0632 5.01269C19.866 5.81539 20.5218 6.47124 20.97 7.05863C21.4384 7.67256 21.75 8.29902 21.75 9.04776C21.75 9.79649 21.4384 10.423 20.97 11.0369C20.5219 11.6243 19.866 12.2801 19.0633 13.0827L13.0828 19.0632ZM11.9399 6.03539C12.7899 5.18538 13.3752 4.60235 13.873 4.22253C14.3535 3.85592 14.6633 3.75 14.9522 3.75C15.2411 3.75 15.551 3.85592 16.0315 4.22253C16.5293 4.60235 17.1146 5.18538 17.9646 6.03539C18.8146 6.88541 19.3977 7.47069 19.7775 7.9685C20.1441 8.449 20.25 8.75886 20.25 9.04776C20.25 9.33665 20.1441 9.64651 19.7775 10.127C19.3977 10.6248 18.8146 11.2101 17.9646 12.0601L13.7713 16.2534L7.74662 10.2287L11.9399 6.03539ZM9.04776 20.25C9.33665 20.25 9.64651 20.1441 10.127 19.7775C10.6248 19.3977 11.2101 18.8146 12.0601 17.9646L12.7107 17.314L6.68596 11.2893L6.03539 11.9399C5.18538 12.7899 4.60235 13.3752 4.22253 13.873C3.85592 14.3535 3.75 14.6633 3.75 14.9522C3.75 15.2411 3.85592 15.551 4.22253 16.0315C4.60235 16.5293 5.18538 17.1146 6.03539 17.9646C6.88541 18.8146 7.47069 19.3977 7.9685 19.7775C8.449 20.1441 8.75886 20.25 9.04776 20.25Z"
                  fill="#6c6c6c"></path>
              </g>
            </svg>
          </Button>
          {/* Reset Button */}
          <Button variant="none" type="button" onClick={handleClear}>
            <svg
              fill="#6c6c6c"
              viewBox="0 0 1920 1920"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#6c6c6c"
              className="h-5 w-5">
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M960 0v112.941c467.125 0 847.059 379.934 847.059 847.059 0 467.125-379.934 847.059-847.059 847.059-467.125 0-847.059-379.934-847.059-847.059 0-267.106 126.607-515.915 338.824-675.727v393.374h112.94V112.941H0v112.941h342.89C127.058 407.38 0 674.711 0 960c0 529.355 430.645 960 960 960s960-430.645 960-960S1489.355 0 960 0"
                  fillRule="evenodd"></path>
              </g>
            </svg>
          </Button>
        </div>
        <HoldToCopyButton canvasRef={canvasRef} />
      </CardFooter>
      <BorderBeam duration={8} size={100} />
    </Card>
  );
}
