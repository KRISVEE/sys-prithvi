import { supabase } from "@/lib/supabase";
import { NodeItem, ArsenalItem } from "@/types/database";
import NodeCard from "@/components/NodeCard";

export const dynamic = 'force-dynamic';

export default async function NodesPage() {
  const [{ data: activeNodes }, { data: arsenalItems }] = await Promise.all([
    supabase.from("nodes").select("*").order("created_at", { ascending: false }),
    supabase.from("arsenal").select("*").order("created_at", { ascending: true })
  ]);

  const nodesToRender = (activeNodes as NodeItem[]) || [];
  const arsenalToRender = (arsenalItems as ArsenalItem[]) || [];

  const groupedArsenal = arsenalToRender.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ArsenalItem[]>);

  return (
    <div className="min-h-screen w-full flex flex-col pt-24 pb-12 px-4 md:px-8 bg-transparent">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12">
        ACTIVE_NODES
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-24">
        {nodesToRender.length === 0 && (
          <div className="text-gray-500 font-mono text-sm col-span-2">No active nodes executing.</div>
        )}
        {nodesToRender.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold tracking-tighter mb-8 border-b border-gray-800 pb-4">
          THE ARSENAL
        </h2>
        {Object.keys(groupedArsenal).length === 0 ? (
          <div className="text-gray-500 font-mono text-sm">Arsenal data not found.</div>
        ) : (
          <div className="flex flex-col gap-12">
            {Object.entries(groupedArsenal).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="text-sm font-mono text-gray-500 mb-6 uppercase tracking-widest">{cat}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-sm text-gray-400">
                  {items.map(item => (
                    <div key={item.id} className="terminal-border p-4 text-center hover:border-gray-500 hover:text-gray-300 transition-colors flex flex-col justify-center gap-2">
                      <div className="font-bold">{item.name}</div>
                      {item.description && <div className="text-[10px] text-gray-600">{item.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
