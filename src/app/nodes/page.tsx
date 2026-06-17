import { supabase } from "@/lib/supabase";
import { NodeItem } from "@/types/database";

export const dynamic = 'force-dynamic';

export default async function NodesPage() {
  const { data: activeNodes, error } = await supabase
    .from("nodes")
    .select("*")
    .order("created_at", { ascending: false });

  const nodesToRender = (activeNodes as NodeItem[]) || [];

  return (
    <div className="w-full pt-32 pb-16">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16">
        ACTIVE_NODES
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {nodesToRender.length === 0 && (
          <div className="text-gray-500 font-mono text-sm col-span-2">No active nodes executing.</div>
        )}
        {nodesToRender.map((node) => (
          <div key={node.id} className="terminal-border p-6 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold tracking-tight">{node.title}</h2>
              <span className="text-[10px] font-mono tracking-widest px-2 py-1 bg-gray-900 border border-gray-700 text-gray-400 uppercase">
                {node.status}
              </span>
            </div>
            <p className="text-gray-400 mb-6 text-sm whitespace-pre-wrap">
              {node.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {node.tags.map((tech) => (
                <span key={tech} className="text-xs font-mono text-gray-500">
                  [{tech.trim()}]
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold tracking-tighter mb-8 border-b border-gray-800 pb-4">
          THE ARSENAL
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-sm text-gray-400">
          <div className="terminal-border p-4 text-center">C#</div>
          <div className="terminal-border p-4 text-center">Python</div>
          <div className="terminal-border p-4 text-center">Three.js</div>
          <div className="terminal-border p-4 text-center">Reinforcement Learning</div>
          <div className="terminal-border p-4 text-center">Math/Stats</div>
        </div>
      </div>
    </div>
  );
}
