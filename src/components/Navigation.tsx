"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navLinks = [
  { path: "/", label: "HUB" },
  { path: "/nodes", label: "NODES" },
  { path: "/frequencies", label: "FREQUENCIES" },
  { path: "/trajectory", label: "TRAJECTORY" },
  { path: "/vault", label: "VAULT" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference pointer-events-auto">
      <div className="font-mono text-sm tracking-widest font-bold">
        SYS.PRITHVI
      </div>
      <div className="flex gap-6 text-xs font-mono tracking-widest">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`relative transition-colors duration-300 ${
              pathname === link.path ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {pathname === link.path && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute -bottom-2 left-0 right-0 h-[1px] bg-white"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
