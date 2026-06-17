"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Frequency, Trajectory, VaultItem } from "@/types/database";

function FrequenciesManager() {
  const [items, setItems] = useState<Frequency[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Long-form");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("frequencies").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("frequencies").insert({ title, type, content_markdown: content });
    if (!error) {
      setTitle("");
      setContent("");
      fetchItems();
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this frequency?")) return;
    await supabase.from("frequencies").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">NEW FREQUENCY</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="TITLE"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-black border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
          >
            <option value="Long-form">Long-form</option>
            <option value="Note">Note</option>
            <option value="Code Snippet">Code Snippet</option>
            <option value="Math Logic">Math Logic</option>
          </select>
          <textarea
            placeholder="MARKDOWN CONTENT"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full h-64 resize-none"
            required
          />
          <button type="submit" className="border border-gray-800 hover:border-white p-3 text-sm font-mono uppercase transition-colors">
            DEPLOY FREQUENCY
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">ARCHIVE</h2>
        {loading ? <p className="font-mono text-sm text-gray-500">LOADING...</p> : (
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <div key={item.id} className="border border-gray-800 p-4 flex justify-between items-center group hover:border-gray-500 transition-colors">
                <div>
                  <div className="text-xs font-mono text-gray-500 mb-1">[{item.type}]</div>
                  <div className="font-bold">{item.title}</div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-xs font-mono text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  [ DEL ]
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrajectoryManager() {
  const [items, setItems] = useState<Trajectory[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [vectorId, setVectorId] = useState("VECTOR 01");
  const [metric, setMetric] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("trajectory").select("*").order("order_index", { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("trajectory").insert({ vector_id: vectorId, metric, title, description, order_index: orderIndex });
    if (!error) {
      setMetric("");
      setTitle("");
      setDescription("");
      setOrderIndex(items.length + 1);
      fetchItems();
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trajectory node?")) return;
    await supabase.from("trajectory").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">NEW VECTOR</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="VECTOR ID (e.g. VECTOR 01)"
              value={vectorId}
              onChange={(e) => setVectorId(e.target.value)}
              className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-1/2"
              required
            />
            <input
              type="number"
              placeholder="ORDER INDEX"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value))}
              className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-1/2"
              required
            />
          </div>
          <input
            type="text"
            placeholder="METRIC / DATE (e.g. Q4 2026)"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <input
            type="text"
            placeholder="TITLE"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <textarea
            placeholder="DESCRIPTION"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full h-32 resize-none"
            required
          />
          <button type="submit" className="border border-gray-800 hover:border-white p-3 text-sm font-mono uppercase transition-colors">
            PLOT VECTOR
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">TIMELINE MATRIX</h2>
        {loading ? <p className="font-mono text-sm text-gray-500">LOADING...</p> : (
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <div key={item.id} className="border border-gray-800 p-4 flex justify-between items-center group hover:border-gray-500 transition-colors">
                <div>
                  <div className="text-xs font-mono text-gray-500 mb-1">[{item.vector_id}] • {item.metric}</div>
                  <div className="font-bold">{item.title}</div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-xs font-mono text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  [ DEL ]
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VaultManager() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("the_vault").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("the_vault").insert({
      target_company: company,
      public_title: title,
      public_summary: summary,
      private_markdown: markdown
    });
    if (!error) {
      setCompany("");
      setTitle("");
      setSummary("");
      setMarkdown("");
      fetchItems();
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this secure vault item?")) return;
    await supabase.from("the_vault").delete().eq("id", id);
    fetchItems();
  };

  const mintKey = async (vaultId: string) => {
    const token = crypto.randomUUID();
    const { error } = await supabase.from("access_tokens").insert({
      token_string: token,
      vault_id: vaultId,
      view_count: 0,
    });
    if (error) {
      alert("Error minting key: " + error.message);
    } else {
      const url = `${window.location.origin}/vault/${vaultId}?token=${token}`;
      prompt("KEY MINTED! SECURE URL:", url);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">NEW SECURE PAYLOAD</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="TARGET COMPANY (e.g. YC, a16z)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <input
            type="text"
            placeholder="PUBLIC TITLE"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <textarea
            placeholder="PUBLIC SUMMARY"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full h-24 resize-none"
            required
          />
          <textarea
            placeholder="PRIVATE MARKDOWN (Encrypted Payload)"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full h-48 resize-none"
            required
          />
          <button type="submit" className="border border-gray-800 hover:border-white p-3 text-sm font-mono uppercase transition-colors">
            SECURE PAYLOAD
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">THE VAULT</h2>
        {loading ? <p className="font-mono text-sm text-gray-500">LOADING...</p> : (
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <div key={item.id} className="border border-gray-800 p-4 flex flex-col gap-4 group hover:border-gray-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-mono text-gray-500 mb-1">TARGET: {item.target_company}</div>
                    <div className="font-bold">{item.public_title}</div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-xs font-mono text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    [ DEL ]
                  </button>
                </div>
                <button
                  onClick={() => mintKey(item.id)}
                  className="bg-white text-black font-mono text-xs py-2 w-full uppercase tracking-widest hover:bg-gray-300 transition-colors"
                >
                  MINT ACCESS KEY
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"FREQUENCIES" | "TRAJECTORY" | "VAULT">("FREQUENCIES");

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full pt-16 pb-32">
      <div className="flex justify-between items-end mb-12 border-b border-gray-800 pb-4">
        <h1 className="text-4xl font-bold tracking-tighter">SYS.ADMIN</h1>
        <button onClick={handleLogout} className="text-xs font-mono text-gray-500 hover:text-white transition-colors">
          [ LOGOUT ]
        </button>
      </div>

      <div className="flex gap-8 mb-12 border-b border-gray-800 overflow-x-auto whitespace-nowrap">
        {["FREQUENCIES", "TRAJECTORY", "VAULT"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-sm font-mono uppercase tracking-widest transition-colors ${
              activeTab === tab ? "text-white border-b-2 border-white" : "text-gray-600 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[50vh]">
        {activeTab === "FREQUENCIES" && <FrequenciesManager />}
        {activeTab === "TRAJECTORY" && <TrajectoryManager />}
        {activeTab === "VAULT" && <VaultManager />}
      </div>
    </div>
  );
}
