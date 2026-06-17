"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { setSystemState, subscribeSystemState } from "@/lib/store";

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
    
    const unsubStore = subscribeSystemState((state) => {
      setCogLoad(state.cognitiveLoad);
    });

    const fetchInitial = async () => {
      const { data, error } = await supabase.from('system_status').select('*').limit(1).maybeSingle();
      if (data && !error) {
        setSystemState({ cognitiveLoad: data.cognitive_load, sysOnline: data.sys_online });
      }
    };
    fetchInitial();

    const channel = supabase
      .channel('system_status_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, (payload: any) => {
        if (payload.new) {
          setSystemState({ 
            cognitiveLoad: payload.new.cognitive_load, 
            sysOnline: payload.new.sys_online 
          });
        }
      })
      .subscribe();
    
    // Save to localStorage every second
    const saveInterval = setInterval(() => {
      const now = Date.now();
      const currentUptime = initialUptime + (now - startTime) / 1000;
      localStorage.setItem("sys_uptime", currentUptime.toString());
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(saveInterval);
      unsubStore();
      supabase.removeChannel(channel);
      
      // Save exact amount on unmount
      const now = Date.now();
      const currentUptime = initialUptime + (now - startTime) / 1000;
      localStorage.setItem("sys_uptime", currentUptime.toString());
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="mt-auto relative md:fixed md:bottom-8 md:right-8 w-full md:w-auto z-20 pb-4 md:pb-0 text-left md:text-right text-[10px] sm:text-xs font-mono tracking-widest text-gray-500 uppercase flex flex-col items-start md:items-end gap-1 pointer-events-none">
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
      <div className="flex gap-2 w-64 justify-start md:justify-end items-center mt-1">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-500 font-bold tracking-widest">SYS.ONLINE</span>
      </div>
    </div>
  );
}
