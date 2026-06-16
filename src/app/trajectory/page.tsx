"use client";

import { motion } from "framer-motion";

export default function TrajectoryPage() {
  const vectors = [
    {
      id: "VECTOR 01",
      metric: "DEPARTURE",
      title: "System Optimization",
      description:
        "Exited traditional academic paths (B.Tech) to eliminate overhead. Shifted focus exclusively to specialized data science, deep technical architectures, and autonomous building.",
    },
    {
      id: "VECTOR 02",
      metric: "EXECUTING",
      title: "Parallel Operations",
      description:
        "Running active nodes in parallel: Cognitive AI modeling (Atman), Web infrastructure scaling (Project BU), Atmospheric design engines (Neptune: Apophenia), and sports simulation data lakes (Xampire Labs).",
    },
    {
      id: "VECTOR 03",
      metric: "T-MINUS 12 MONTHS",
      title: "Simulation Deployment",
      description:
        "Scaling Xampire Labs into production infrastructure. Launching proprietary predictive engines for real-time sports analytics and simulation.",
    },
    {
      id: "VECTOR 04",
      metric: "STRATEGIC EXPANSION",
      title: "Venture Multiplication",
      description:
        "Consolidating software nodes into a multi-layer deep-tech holding system. Scaling internal automation infrastructure to control cross-market architectures.",
    },
    {
      id: "VECTOR 05",
      metric: "TERMINAL GOAL",
      title: "Apex Scale & Acquisition",
      description:
        "Building the world's highest-leverage operational entity. Achieving absolute sovereign execution capability, scaling up to major global ventures and tactical assets (e.g., private fighter aviation infrastructure).",
    },
  ];

  return (
    <div className="w-full pt-32 pb-32">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold tracking-tighter mb-24"
      >
        TRAJECTORY_MATRIX
      </motion.h1>

      <div className="relative border-l border-gray-800 ml-4 md:ml-8">
        {vectors.map((vector, index) => (
          <motion.div
            key={vector.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="mb-24 ml-10 relative group"
          >
            {/* Timeline Node Point */}
            <span className="absolute -left-[45px] top-1.5 h-3 w-3 rounded-none bg-gray-900 border border-gray-500 group-hover:bg-white group-hover:border-white transition-colors duration-500" />

            <div className="flex flex-col gap-1 mb-4">
              <span className="text-xs font-mono tracking-widest text-gray-600 uppercase">
                [{vector.id}] • {vector.metric}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                {vector.title}
              </h2>
            </div>

            <p className="text-gray-400 font-mono text-sm max-w-2xl leading-relaxed mt-4 terminal-border p-4 bg-black/40 border-gray-800/50">
              {vector.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
