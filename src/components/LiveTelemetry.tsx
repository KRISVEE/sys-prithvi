"use client";

import { useEffect, useState } from "react";

export default function LiveTelemetry() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<string>("");
  const [uptime, setUptime] = useState<number>(0);
  const [cogLoad, setCogLoad] = useState<number>(85);

  useEffect(() => {
    setMounted(true);
    
    // Initialize uptime from localStorage or 0
    const storedUptime = localStorage.getItem("sys_uptime");
    const initialUptime = storedUptime ? parseFloat(storedUptime) : 0;
    
    const startTime = Date.now();

    const update = () => {
      const now = Date.now();
      
      const date = new Date(now);
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      
      const timeString = new Intl.DateTimeFormat("en-IN", options).format(date);
      const ms = date.getMilliseconds().toString().padStart(3, "0");
      setTime(`${timeString}.${ms} IST`);
      
      // Calculate exact delta and add to initial
      const currentUptime = initialUptime + (now - startTime) / 1000;
      setUptime(currentUptime);
    };

    update();
    const interval = setInterval(update, 75);
    
    // Cognitive Load Fluctuation
    const cogInterval = setInterval(() => {
      setCogLoad(Math.floor(Math.random() * (94 - 82 + 1) + 82));
    }, 2000);
    
    // Save to localStorage every second
    const saveInterval = setInterval(() => {
      const now = Date.now();
      const currentUptime = initialUptime + (now - startTime) / 1000;
      localStorage.setItem("sys_uptime", currentUptime.toString());
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(cogInterval);
      clearInterval(saveInterval);
      
      // Save exact amount on unmount
      const now = Date.now();
      const currentUptime = initialUptime + (now - startTime) / 1000;
      localStorage.setItem("sys_uptime", currentUptime.toString());
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-8 sm:left-auto sm:right-8 p-4 sm:p-0 bg-black/80 sm:bg-transparent z-50 pointer-events-none font-mono text-[10px] sm:text-xs tracking-widest text-gray-500 uppercase flex flex-col items-start sm:items-end gap-1 text-left sm:text-right">
      <div className="flex gap-4 w-64 justify-between">
        <span>SYS.STATE:</span>
        <span className="text-gray-300">NOMINALLY DECENTRALIZED</span>
      </div>
      <div className="flex gap-4 w-64 justify-between">
        <span>COGNITIVE LOAD:</span>
        <span className="text-gray-300">{cogLoad}%</span>
      </div>
      <div className="flex gap-4 w-64 justify-between">
        <span>LOCAL TIME:</span>
        <span className="text-gray-300">{time}</span>
      </div>
      <div className="flex gap-4 w-64 justify-between">
        <span>SESSION UPTIME:</span>
        <span className="text-gray-300">{uptime.toFixed(1)}s</span>
      </div>
      <div className="flex gap-2 w-64 justify-start sm:justify-end items-center mt-1">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-500 font-bold tracking-widest">SYS.ONLINE</span>
      </div>
    </div>
  );
}
