import { supabase } from "@/lib/supabase";
import { Frequency } from "@/types/database";

export const dynamic = 'force-dynamic';

export default async function FrequenciesPage() {
  const { data: frequencies, error } = await supabase
    .from("frequencies")
    .select("*")
    .order("created_at", { ascending: false });

  const freqs = (frequencies as Frequency[]) || [];

  return (
    <div className="w-full pt-32 pb-16 px-4 sm:px-8 lg:px-12">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16">
        FREQUENCIES
      </h1>

      <div className="space-y-16">
        {freqs.length === 0 && (
          <div className="text-gray-500 font-mono text-sm">No frequencies detected. Silence on the line.</div>
        )}
        {freqs.map((freq) => (
          <div 
            key={freq.id} 
            className={`border-l-2 pl-6 py-2 ${
              freq.type === 'Long-form' 
                ? 'border-gray-400' 
                : 'border-red-900/50 bg-red-950/10'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className={`text-[10px] font-mono tracking-widest px-2 py-1 uppercase ${
                freq.type === 'Long-form' ? 'bg-gray-800 text-gray-300' : 'bg-red-950 text-red-400 border border-red-900/50'
              }`}>
                {freq.type}
              </span>
              <span className="text-xs font-mono text-gray-600">
                {new Date(freq.created_at).toLocaleDateString("en-IN")}
              </span>
            </div>
            
            {freq.title && (
              <h2 className="text-2xl font-bold tracking-tight mb-4">{freq.title}</h2>
            )}
            
            <div 
              className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white prose-img:rounded-lg prose-img:border prose-img:border-gray-800 prose-img:w-full max-w-none font-mono text-sm"
              dangerouslySetInnerHTML={{ __html: freq.content_markdown }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
