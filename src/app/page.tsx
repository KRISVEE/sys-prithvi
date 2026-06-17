"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import LiveTelemetry from "@/components/LiveTelemetry";
import Comms from "@/components/Comms";
import BlackholeSimulation from "@/components/BlackholeSimulation";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':,./<>?";

function ScrambleText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (char === " ") return " ";
            return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3; // Controls speed of reveal
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}

export default function Hub() {
  const [glitch, setGlitch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-1, 1], [15, -15]);
  const rotateY = useTransform(springX, [-1, 1], [-15, 15]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    let keyBuffer = "";
    const target = "atman";

    const handleKeyDown = (e: KeyboardEvent) => {
      keyBuffer += e.key.toLowerCase();
      if (keyBuffer.length > target.length) {
        keyBuffer = keyBuffer.slice(-target.length);
      }
      if (keyBuffer === target) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 5000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <main
      onMouseMove={handleMouseMove}
      className={`relative w-full h-[100dvh] overflow-x-hidden md:overflow-hidden bg-black text-white flex flex-col transition-colors duration-200 ${
        glitch ? "bg-red-950 text-shadow-glitch" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          transformPerspective: 1000
        }}
        className="flex-grow flex flex-col justify-center items-center w-full relative md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10 text-center mt-12 md:mt-0"
      >
        <h1
          className={`text-6xl md:text-8xl font-bold tracking-tighter ${
            glitch ? "text-red-500" : "text-white"
          }`}
        >
          <ScrambleText text="PRITHVI" />
        </h1>
        <p className="mt-6 text-gray-400 font-mono text-sm max-w-lg leading-relaxed uppercase tracking-widest">
          Definition is a cage, my nature is just a bit too contradictory _-_
        </p>
      </motion.div>

      <div className="p-4 md:p-0 relative md:absolute md:bottom-8 md:left-8 z-50 w-full md:w-auto">
        <Comms />
      </div>
      <BlackholeSimulation />
      <div className="p-4 md:p-0 relative md:absolute md:bottom-8 md:right-8 z-50 w-full md:w-auto text-left md:text-right mt-auto md:mt-0">
        <LiveTelemetry />
      </div>
    </main>
  );
}
