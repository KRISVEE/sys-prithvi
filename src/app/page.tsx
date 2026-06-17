"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LiveTelemetry from "@/components/LiveTelemetry";
import Comms from "@/components/Comms";

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

  useEffect(() => {
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`flex flex-col min-h-[100dvh] p-4 md:p-8 overflow-hidden transition-colors duration-200 ${
        glitch ? "bg-red-950 text-shadow-glitch" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex-grow flex flex-col justify-center items-start md:items-center w-full z-10 py-8 md:py-0"
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
      <LiveTelemetry />
    </div>
  );
}
