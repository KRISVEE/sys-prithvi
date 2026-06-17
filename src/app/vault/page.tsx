import { createClient } from "@supabase/supabase-js";
import { VaultItem } from "@/types/database";
import { Lock } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function VaultPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: vaultItems, error } = await supabaseAdmin
    .from("the_vault")
    .select("id, target_company, public_title, public_summary, created_at")
    .order("created_at", { ascending: false });

  const items = (vaultItems as Partial<VaultItem>[]) || [];

  return (
    <div className="min-h-screen w-full flex flex-col pt-24 pb-12 px-4 md:px-8 bg-transparent">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 flex items-center gap-4">
        THE_VAULT <Lock className="w-8 h-8 md:w-12 md:h-12 text-gray-600" />
      </h1>

      <div className="space-y-8">
        {items.length === 0 && (
          <div className="text-gray-500 font-mono text-sm">Vault is currently sealed.</div>
        )}
        {items.map((item) => (
          <div key={item.id} className="terminal-border p-6 hover:border-gray-600 transition-colors relative group">
            <div className="absolute top-6 right-6 text-gray-600 group-hover:text-white transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            
            <span className="text-[10px] font-mono tracking-widest px-2 py-1 bg-gray-900 border border-gray-800 text-gray-400 uppercase mb-4 inline-block">
              {item.target_company}
            </span>
            
            <h2 className="text-2xl font-bold tracking-tight mb-4">{item.public_title}</h2>
            
            <p className="text-gray-400 font-mono text-sm max-w-2xl">
              {item.public_summary}
            </p>
            
            <div className="mt-6 flex items-center gap-4">
              <span className="text-xs font-mono text-gray-600 border border-gray-800 px-3 py-1">
                ENCRYPTED PAYLOAD
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
