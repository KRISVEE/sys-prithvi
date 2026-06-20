"use client";
import { useEffect, useState } from "react";

export default function HUDOpacitySlider() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    document.documentElement.style.setProperty("--container-opacity", opacity.toString());
  }, [opacity]);

  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-[100] opacity-20 hover:opacity-100 transition-opacity">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={opacity}
        onChange={(e) => setOpacity(parseFloat(e.target.value))}
        className="w-1 h-32 bg-zinc-800 rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white"
        style={{ WebkitAppearance: 'slider-vertical' } as any}
      />
    </div>
  );
}
