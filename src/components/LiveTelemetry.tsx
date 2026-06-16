"use client";

import { useEffect, useState } from "react";

export default function LiveTelemetry() {
  const [time, setTime] = useState<string>("");
  const [uptime, setUptime] = useState<number>(0);

  useEffect(() => {
    const startTime = Date.now();

    const update = () => {
      const now = Date.now();
      
      // Update Time
      const date = new Date(now);
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      
      // Format with milliseconds
      const timeString = new Intl.DateTimeFormat("en-IN", options).format(date);
      const ms = date.getMilliseconds().toString().padStart(3, "0");
      setTime(`${timeString}.${ms} IST`);
      
      // Update Uptime
      setUptime((now - startTime) / 1000);
    };

    update();
    const interval = setInterval(update, 75);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 pointer-events-none font-mono text-[10px] sm:text-xs tracking-widest text-gray-500 uppercase flex flex-col items-end gap-1 text-right">
      <div className="flex gap-4 w-64 justify-between">
        <span>LOCATION:</span>
        <span className="text-gray-300">CHN, IND [13.0827° N, 80.2707° E]</span>
      </div>
      <div className="flex gap-4 w-64 justify-between">
        <span>LOCAL TIME:</span>
        <span className="text-gray-300">{time}</span>
      </div>
      <div className="flex gap-4 w-64 justify-between">
        <span>SESSION UPTIME:</span>
        <span className="text-gray-300">{uptime.toFixed(1)}s</span>
      </div>
      <div className="flex gap-2 w-64 justify-end items-center mt-1">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-500 font-bold tracking-widest">SYS.ONLINE</span>
      </div>
    </div>
  );
}
