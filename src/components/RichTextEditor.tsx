"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[250px] p-4 text-sm font-mono text-gray-300',
      },
    },
  });

  // Sync value from props if it changes externally (e.g., reset after submit)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="p-4 border border-gray-800 text-xs font-mono text-gray-500 h-[250px] flex items-center justify-center">LOADING VISUAL EDITOR...</div>;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // Upload to Supabase vault-assets
    const { error } = await supabase.storage
      .from("vault-assets")
      .upload(fileName, file);

    if (error) {
      alert("Image upload failed! Ensure 'vault-assets' bucket exists and RLS allows inserts. Error: " + error.message);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("vault-assets").getPublicUrl(fileName);
    
    // Inject image
    editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full flex flex-col border border-gray-800 bg-black relative">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 p-2 bg-[#0a0a0a]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-xs font-mono transition-colors ${editor.isActive('bold') ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          BOLD
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-xs font-mono transition-colors ${editor.isActive('italic') ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          ITALIC
        </button>
        <span className="w-px h-4 bg-gray-800 mx-1"></span>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-xs font-mono transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-xs font-mono transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          H2
        </button>
        <span className="w-px h-4 bg-gray-800 mx-1"></span>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-xs font-mono transition-colors ${editor.isActive('bulletList') ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          LIST
        </button>
        <span className="w-px h-4 bg-gray-800 mx-1"></span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-1 text-xs font-mono text-green-500 hover:text-green-400 transition-colors"
        >
          [+ IMAGE]
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
      
      {/* Fallback placeholder (absolute positioned under text if empty) */}
      {editor.isEmpty && placeholder && (
        <div className="absolute top-[50px] left-[17px] text-sm font-mono text-gray-600 pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* Editor Area */}
      <EditorContent editor={editor} className="cursor-text" onClick={() => editor.commands.focus()} />
      
    </div>
  );
}
