"use client";

import Link from "next/link";

const links = [
  { label: "GITHUB", href: "#" },
  { label: "X / TWITTER", href: "#" },
  { label: "LINKEDIN", href: "#" },
  { label: "MEDIUM", href: "#" },
  { label: "INSTAGRAM", href: "#" },
  { label: "SECURE COMMS", href: "mailto:#" },
];

export default function Comms() {
  return (
    <div className="fixed bottom-8 left-8 z-50 pointer-events-auto font-mono text-[10px] sm:text-xs text-gray-500 flex flex-col gap-2">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="group flex items-center transition-colors duration-300 hover:text-white"
        >
          <span className="opacity-0 group-hover:opacity-100 mr-2 text-white transition-opacity duration-300">
            &gt;
          </span>
          <span className="tracking-widest uppercase">[{link.label}]</span>
        </Link>
      ))}
    </div>
  );
}
