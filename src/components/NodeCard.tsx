"use client";

import { NodeItem } from "@/types/database";
import { useState } from "react";

export default function NodeCard({ node }: { node: NodeItem }) {
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    if (node.link) {
      window.open(node.link, "_blank", "noopener,noreferrer");
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div 
      onClick={handleClick} 
      className="terminal-border p-6 hover:border-white/20 transition-all cursor-pointer relative group"
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold tracking-tight group-hover:text-white transition-colors">{node.title}</h2>
        <span className="text-[10px] font-mono tracking-widest px-2 py-1 bg-gray-900 border border-gray-700 text-gray-400 uppercase">
          {node.status}
        </span>
      </div>
      <p className="text-gray-400 mb-6 text-sm whitespace-pre-wrap group-hover:text-gray-300 transition-colors">
        {node.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {node.tags.map((tech) => (
          <span key={tech} className="text-xs font-mono text-gray-500">
            [{tech.trim()}]
          </span>
        ))}
      </div>
      
      {showToast && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/20 px-4 py-2 text-[10px] font-mono tracking-widest text-white shadow-2xl z-10 whitespace-nowrap uppercase">
          Let us cook first
        </div>
      )}
    </div>
  );
}
