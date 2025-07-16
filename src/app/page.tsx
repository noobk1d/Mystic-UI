"use client";

import "./globals.css";
import BorderCard from "./components/signature/BorderCard";
import { InteractiveGridPattern } from "./components/ui/interactive-grid-pattern";
import { Button } from "./components/ui/button";
import { useRef, useState } from "react";
import { ConfigMenu } from "./components/ui/ConfigMenu";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const configBtnRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [color, setColor] = useState("#222");
  const handleReset = () => {
    setStrokeWidth(4);
    setColor("#222");
  };
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Config button at top right */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          ref={configBtnRef}
          variant="secondary"
          className={
            `min-w-[270px] flex items-center justify-center relative transition-all duration-200 ` +
            (menuOpen ? "rounded-b-none rounded-t-md" : "rounded-md")
          }
          onClick={() => {
            console.log("Config button clicked, menuOpen will toggle");
            setMenuOpen((v) => !v);
          }}>
          <span className="mx-auto">config</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
            <svg
              fill="#ffffff"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 24.75 24.75"
              xmlSpace="preserve"
              stroke="#ffffff"
              className="w-3 h-3">
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <g>
                  <path d="M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2 c-1.104,0-2,0.896-2,2c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855,10.375,22.75,10.375z M22.75,18.875H2 c-1.104,0-2,0.896-2,2s0.896,2,2,2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z"></path>
                </g>
              </g>
            </svg>
          </span>
        </Button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "100%",
                zIndex: 30,
              }}>
              <ConfigMenu
                open={true}
                onClose={() => setMenuOpen(false)}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                color={color}
                setColor={setColor}
                onReset={handleReset}
                anchorRef={configBtnRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <InteractiveGridPattern className="fixed inset-0 h-full w-full z-0" />
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <BorderCard strokeWidth={strokeWidth} color={color} />
      </div>
    </div>
  );
}
