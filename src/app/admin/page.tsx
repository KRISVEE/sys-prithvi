"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Frequency, Trajectory, VaultItem, NodeItem, ArsenalItem } from "@/types/database";
import RichTextEditor from "@/components/RichTextEditor";

function FrequenciesManager() {
  const [items, setItems] = useState<Frequency[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Long-form");
  const [content, setContent] = useState("");
  const [editorKey, setEditorKey] = useState(Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);

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
    if (editingId) {
      const { error } = await supabase.from("frequencies").update({ title, type, content_markdown: content }).eq("id", editingId);
      if (!error) {
        setEditingId(null);
        setTitle("");
        setContent("");
        setEditorKey(Date.now());
        fetchItems();
      } else {
        alert(error.message);
      }
    } else {
      const { error } = await supabase.from("frequencies").insert({ title, type, content_markdown: content });
      if (!error) {
        setTitle("");
        setContent("");
        setEditorKey(Date.now());
        fetchItems();
      } else {
        alert(error.message);
      }
    }
  };

  const handleEdit = (item: Frequency) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setType(item.type || "");
    setContent(item.content_markdown || "");
    setEditorKey(Date.now());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this frequency?")) return;
    await supabase.from("frequencies").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
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
          <RichTextEditor
            key={editorKey}
            placeholder="RICH TEXT CONTENT"
            value={content}
            onChange={setContent}
          />
          <button type="submit" className="border border-gray-800 hover:border-white p-3 text-sm font-mono uppercase transition-colors">
            {editingId ? "UPDATE FREQUENCY" : "DEPLOY FREQUENCY"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setTitle(""); setContent(""); setEditorKey(Date.now()); }} className="border border-gray-800 hover:border-red-500 p-3 text-sm font-mono uppercase transition-colors text-red-500">
              CANCEL EDIT
            </button>
          )}
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
                <div className="flex gap-4">
                  <button onClick={() => handleEdit(item)} className="text-xs font-mono text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    [ EDIT ]
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs font-mono text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    [ DEL ]
                  </button>
                </div>
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
  const [editingId, setEditingId] = useState<string | null>(null);

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
    if (editingId) {
      const { error } = await supabase.from("trajectory").update({ vector_id: vectorId, metric, title, description, order_index: orderIndex }).eq("id", editingId);
      if (!error) {
        setEditingId(null);
        setMetric("");
        setTitle("");
        setDescription("");
        setOrderIndex(items.length);
        fetchItems();
      } else {
        alert(error.message);
      }
    } else {
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
    }
  };

  const handleEdit = (item: Trajectory) => {
    setEditingId(item.id);
    setVectorId(item.vector_id);
    setMetric(item.metric);
    setTitle(item.title);
    setDescription(item.description);
    setOrderIndex(item.order_index);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trajectory node?")) return;
    await supabase.from("trajectory").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
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
            {editingId ? "UPDATE VECTOR" : "PLOT VECTOR"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setMetric(""); setTitle(""); setDescription(""); }} className="border border-gray-800 hover:border-red-500 p-3 text-sm font-mono uppercase transition-colors text-red-500">
              CANCEL EDIT
            </button>
          )}
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
                <div className="flex gap-4">
                  <button onClick={() => handleEdit(item)} className="text-xs font-mono text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    [ EDIT ]
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs font-mono text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    [ DEL ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VaultItemCard({ item, onDelete, onEdit, onMint }: { item: VaultItem, onDelete: (id: string) => void, onEdit: (item: VaultItem) => void, onMint: (id: string) => Promise<string | null> }) {
  const [copied, setCopied] = useState(false);

  const handleMint = async () => {
    const url = await onMint(item.id);
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-gray-800 p-4 flex flex-col gap-4 group hover:border-gray-500 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs font-mono text-gray-500 mb-1">TARGET: {item.target_company}</div>
          <div className="font-bold">{item.public_title}</div>
          <div className="text-[10px] font-mono text-gray-600 mt-2">{new Date(item.created_at).toLocaleDateString()}</div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => onEdit(item)} className="text-xs font-mono text-blue-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100">
            [ EDIT ]
          </button>
          <button onClick={() => onDelete(item.id)} className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            [ DELETE ]
          </button>
        </div>
      </div>
      <button
        onClick={handleMint}
        className="text-left text-xs font-mono text-green-500 hover:text-green-400 transition-colors w-fit"
      >
        {copied ? "[ LINK COPIED ]" : "[ MINT SECURE LINK ]"}
      </button>
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
  const [editorKey, setEditorKey] = useState(Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("the_vault").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as VaultItem[]);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from("the_vault").update({
        target_company: company,
        public_title: title,
        public_summary: summary,
        private_markdown: markdown
      }).eq("id", editingId);
      if (!error) {
        setEditingId(null);
        setCompany("");
        setTitle("");
        setSummary("");
        setMarkdown("");
        setEditorKey(Date.now());
        fetchItems();
      } else {
        alert("Error updating payload. Check RLS policies: " + error.message);
      }
    } else {
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
        setEditorKey(Date.now());
        fetchItems();
      } else {
        alert("Error creating payload. Check RLS policies: " + error.message);
      }
    }
  };

  const handleEdit = (item: VaultItem) => {
    setEditingId(item.id);
    setCompany(item.target_company || "");
    setTitle(item.public_title || "");
    setSummary(item.public_summary || "");
    setMarkdown(item.private_markdown || "");
    setEditorKey(Date.now());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this secure vault item?")) return;
    
    // Optimistic UI update
    setItems((prev) => prev.filter((i) => i.id !== id));
    
    const { error } = await supabase.from("the_vault").delete().eq("id", id);
    if (error) {
      alert("Failed to delete. Check RLS policies: " + error.message);
      fetchItems(); // Revert on failure
    }
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
      return null;
    }
    return `${window.location.origin}/vault/${vaultId}?token=${token}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
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
          <RichTextEditor
            key={editorKey}
            placeholder="PRIVATE PAYLOAD (Rich Text / HTML)"
            value={markdown}
            onChange={setMarkdown}
          />
          <button type="submit" className="border border-gray-800 hover:border-white p-3 text-sm font-mono uppercase transition-colors">
            {editingId ? "UPDATE PAYLOAD" : "SECURE PAYLOAD"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setCompany(""); setTitle(""); setSummary(""); setMarkdown(""); setEditorKey(Date.now()); }} className="border border-gray-800 hover:border-red-500 p-3 text-sm font-mono uppercase transition-colors text-red-500">
              CANCEL EDIT
            </button>
          )}
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">THE VAULT</h2>
        {loading ? <p className="font-mono text-sm text-gray-500">LOADING...</p> : (
          <div className="flex flex-col gap-4">
            {items.length === 0 && (
              <p className="font-mono text-xs text-gray-600">NO SECURE ITEMS FOUND.</p>
            )}
            {items.map(item => (
              <VaultItemCard key={item.id} item={item} onDelete={handleDelete} onEdit={handleEdit} onMint={mintKey} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NodesManager() {
  const [items, setItems] = useState<NodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("EXECUTING");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("nodes").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as NodeItem[]);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(",").map(t => t.trim()).filter(t => t.length > 0);
    if (editingId) {
      const { error } = await supabase.from("nodes").update({
        title,
        status,
        description,
        tags: tagArray
      }).eq("id", editingId);
      if (!error) {
        setEditingId(null);
        setTitle("");
        setStatus("EXECUTING");
        setDescription("");
        setTags("");
        fetchItems();
      } else {
        alert("Error updating node. Check RLS policies: " + error.message);
      }
    } else {
      const { error } = await supabase.from("nodes").insert({
        title,
        status,
        description,
        tags: tagArray
      });
      if (!error) {
        setTitle("");
        setStatus("EXECUTING");
        setDescription("");
        setTags("");
        fetchItems();
      } else {
        alert("Error creating node. Check RLS policies: " + error.message);
      }
    }
  };

  const handleEdit = (item: NodeItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setStatus(item.status);
    setDescription(item.description || "");
    setTags((item.tags || []).join(", "));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this node?")) return;
    
    // Optimistic UI update
    setItems((prev) => prev.filter((i) => i.id !== id));
    
    const { error } = await supabase.from("nodes").delete().eq("id", id);
    if (error) {
      alert("Failed to delete. Check RLS policies: " + error.message);
      fetchItems(); // Revert on failure
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">NEW NODE</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="TITLE (e.g. Atman)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <input
            type="text"
            placeholder="STATUS (e.g. EXECUTING, IN R&D)"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <textarea
            placeholder="DESCRIPTION"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full h-24 resize-none"
            required
          />
          <input
            type="text"
            placeholder="TAGS (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <button type="submit" className="border border-gray-800 hover:border-white p-3 text-sm font-mono uppercase transition-colors">
            {editingId ? "UPDATE NODE" : "INITIALIZE NODE"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setTitle(""); setStatus("EXECUTING"); setDescription(""); setTags(""); }} className="border border-gray-800 hover:border-red-500 p-3 text-sm font-mono uppercase transition-colors text-red-500">
              CANCEL EDIT
            </button>
          )}
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">ACTIVE NODES</h2>
        {loading ? <p className="font-mono text-sm text-gray-500">LOADING...</p> : (
          <div className="flex flex-col gap-4">
            {items.length === 0 && (
              <p className="font-mono text-xs text-gray-600">NO NODES FOUND.</p>
            )}
            {items.map(item => (
              <div key={item.id} className="border border-gray-800 p-4 flex flex-col gap-4 group hover:border-gray-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-mono text-gray-500 mb-1">STATUS: {item.status}</div>
                    <div className="font-bold">{item.title}</div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleEdit(item)} className="text-xs font-mono text-blue-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100">
                      [ EDIT ]
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      [ DELETE ]
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArsenalManager() {
  const [items, setItems] = useState<ArsenalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState("FRAMEWORKS");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("arsenal").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as ArsenalItem[]);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from("arsenal").update({
        category,
        name,
        description
      }).eq("id", editingId);
      if (!error) {
        setEditingId(null);
        setCategory("FRAMEWORKS");
        setName("");
        setDescription("");
        fetchItems();
      } else {
        alert("Error updating arsenal item. Check RLS policies: " + error.message);
      }
    } else {
      const { error } = await supabase.from("arsenal").insert({
        category,
        name,
        description
      });
      if (!error) {
        setCategory("FRAMEWORKS");
        setName("");
        setDescription("");
        fetchItems();
      } else {
        alert("Error creating arsenal item. Check RLS policies: " + error.message);
      }
    }
  };

  const handleEdit = (item: ArsenalItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setName(item.name);
    setDescription(item.description || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this arsenal item?")) return;
    
    setItems((prev) => prev.filter((i) => i.id !== id));
    
    const { error } = await supabase.from("arsenal").delete().eq("id", id);
    if (error) {
      alert("Failed to delete. Check RLS policies: " + error.message);
      fetchItems();
    }
  };

  // Group items by category for UI
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ArsenalItem[]>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">NEW WEAPON</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="CATEGORY (e.g. FRAMEWORKS, HARDWARE)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full uppercase"
            required
          />
          <input
            type="text"
            placeholder="NAME (e.g. Next.js, Supabase)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full"
            required
          />
          <textarea
            placeholder="DESCRIPTION (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-transparent border border-gray-800 p-3 text-sm font-mono focus:outline-none focus:border-white w-full h-24 resize-none"
          />
          <button type="submit" className="border border-gray-800 hover:border-white p-3 text-sm font-mono uppercase transition-colors">
            {editingId ? "UPDATE WEAPON" : "ADD TO ARSENAL"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setCategory("FRAMEWORKS"); setName(""); setDescription(""); }} className="border border-gray-800 hover:border-red-500 p-3 text-sm font-mono uppercase transition-colors text-red-500">
              CANCEL EDIT
            </button>
          )}
        </form>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-6 tracking-tighter">CURRENT LOADOUT</h2>
        {loading ? <p className="font-mono text-sm text-gray-500">LOADING...</p> : (
          <div className="flex flex-col gap-8">
            {Object.keys(groupedItems).length === 0 && (
              <p className="font-mono text-xs text-gray-600">ARSENAL EMPTY.</p>
            )}
            {Object.entries(groupedItems).map(([cat, catItems]) => (
              <div key={cat}>
                <h3 className="text-xs font-mono text-gray-500 mb-4 border-b border-gray-800 pb-2">{cat}</h3>
                <div className="flex flex-col gap-2">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start group">
                      <div>
                        <div className="font-bold text-sm">{item.name}</div>
                        {item.description && <div className="text-xs text-gray-500 font-mono mt-1">{item.description}</div>}
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => handleEdit(item)} className="text-xs font-mono text-blue-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100">
                          [ EDIT ]
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                          [ DELETE ]
                        </button>
                      </div>
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"ARSENAL" | "NODES" | "FREQUENCIES" | "TRAJECTORY" | "VAULT">("ARSENAL");

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen w-full flex flex-col pt-24 pb-12 px-4 md:px-8 bg-transparent">
      <div className="flex justify-between items-end mb-12 border-b border-gray-800 pb-4">
        <h1 className="text-4xl font-bold tracking-tighter">SYS.ADMIN</h1>
        <button onClick={handleLogout} className="text-xs font-mono text-gray-500 hover:text-white transition-colors">
          [ LOGOUT ]
        </button>
      </div>

      <div className="flex gap-8 mb-12 border-b border-gray-800 overflow-x-auto whitespace-nowrap hide-scrollbar">
        {["ARSENAL", "NODES", "FREQUENCIES", "TRAJECTORY", "VAULT"].map((tab) => (
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
        {activeTab === "ARSENAL" && <ArsenalManager />}
        {activeTab === "NODES" && <NodesManager />}
        {activeTab === "FREQUENCIES" && <FrequenciesManager />}
        {activeTab === "TRAJECTORY" && <TrajectoryManager />}
        {activeTab === "VAULT" && <VaultManager />}
      </div>
    </div>
  );
}
