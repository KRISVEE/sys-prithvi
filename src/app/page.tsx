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
    <div
      onMouseMove={handleMouseMove}
      className={`flex flex-col min-h-[100dvh] p-4 md:p-8 overflow-hidden transition-colors duration-200 ${
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
        className="flex-grow flex flex-col items-center justify-center text-center w-full z-10 py-8 md:py-0 mx-auto"
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
        <Comms />
      </motion.div>
      <BlackholeSimulation />
      <LiveTelemetry />
    </div>
  );
}
