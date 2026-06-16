import { supabase } from "@/lib/supabase";
import { ActiveNode } from "@/types/database";

// Pre-populated default state
const defaultNodes: ActiveNode[] = [
  {
    id: "1",
    title: "Atman",
    status: "ACTIVE",
    tech_stack: ["Python", "Reinforcement Learning"],
    description: "Cognitive AI / modeling human thought.",
    url: null,
  },
  {
    id: "2",
    title: "Xampire Labs",
    status: "SCALING",
    tech_stack: ["Next.js", "C#", "Three.js"],
    description: "Deep-tech sports simulation infrastructure.",
    url: null,
  },
  {
    id: "3",
    title: "Project BU",
    status: "BUILDING",
    tech_stack: ["System Architecture"],
    description: "Core infrastructure building.",
    url: null,
  },
  {
    id: "4",
    title: "Neptune: Apophenia",
    status: "IN DEVELOPMENT",
    tech_stack: ["Unity", "C#"],
    description: "Atmospheric psychological horror, pattern-recognition mechanics.",
    url: null,
  },
];

export default async function NodesPage() {
  const { data: activeNodes, error } = await supabase
    .from("active_nodes")
    .select("*");

  const nodesToRender = (activeNodes && activeNodes.length > 0) ? (activeNodes as ActiveNode[]) : defaultNodes;

  return (
    <div className="w-full pt-32 pb-16">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16">
        ACTIVE_NODES
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {nodesToRender.map((node) => (
          <div key={node.id} className="terminal-border p-6 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold tracking-tight">{node.title}</h2>
              <span className="text-[10px] font-mono tracking-widest px-2 py-1 bg-gray-900 border border-gray-700 text-gray-400 uppercase">
                {node.status}
              </span>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
              {node.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {node.tech_stack.map((tech) => (
                <span key={tech} className="text-xs font-mono text-gray-500">
                  [{tech}]
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
