"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LiveTelemetry from "@/components/LiveTelemetry";

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
      className={`min-h-[80vh] flex flex-col justify-center transition-colors duration-200 ${
        glitch ? "bg-red-950 text-shadow-glitch" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <h1
          className={`text-4xl md:text-7xl font-bold tracking-tighter ${
            glitch ? "text-red-500" : "text-white"
          }`}
        >
          ĀTMAN / INFRASTRUCTURE
        </h1>
        <p className="mt-6 text-gray-400 font-mono text-sm max-w-lg leading-relaxed uppercase tracking-widest">
          Cognitive Modeling • Deep-Tech Simulations • Systems Architecture
        </p>

      </motion.div>
      <LiveTelemetry />
    </div>
  );
}
