"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Trajectory } from "@/types/database";

export default function TrajectoryPage() {
  const [vectors, setVectors] = useState<Trajectory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVectors = async () => {
      const { data } = await supabase
        .from("trajectory")
        .select("*")
        .order("order_index", { ascending: true });
      if (data) {
        setVectors(data);
      }
      setLoading(false);
    };

    fetchVectors();
  }, []);

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
        {loading && (
          <div className="font-mono text-sm text-gray-500 ml-10">
            [SYNCING VECTORS...]
          </div>
        )}
        {!loading && vectors.length === 0 && (
          <div className="font-mono text-sm text-gray-500 ml-10">
            [NO VECTORS FOUND]
          </div>
        )}
        {!loading && vectors.map((vector, index) => (
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
                [{vector.vector_id}] • {vector.metric}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                {vector.title}
              </h2>
            </div>

            <p className="text-gray-400 font-mono text-sm max-w-2xl leading-relaxed mt-4 terminal-border p-4 bg-black/40 border-gray-800/50 whitespace-pre-wrap">
              {vector.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
