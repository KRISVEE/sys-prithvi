"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [initialContent, setInitialContent] = useState<string | null>(null);

  const editor = useCreateBlockNote({
    uploadFile: async (file: File) => {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload to Supabase vault-assets
      const { error } = await supabase.storage
        .from("vault-assets")
        .upload(fileName, file);

      if (error) {
        alert("Image upload failed! Ensure 'vault-assets' bucket exists and RLS allows inserts. Error: " + error.message);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("vault-assets").getPublicUrl(fileName);
      return urlData.publicUrl;
    },
  });

  // Handle setting initial HTML content asynchronously 
  useEffect(() => {
    async function loadInitialHTML() {
      if (value && editor && initialContent === null) {
        const blocks = await editor.tryParseHTMLToBlocks(value);
        editor.replaceBlocks(editor.document, blocks);
        setInitialContent(value);
      }
    }
    loadInitialHTML();
  }, [value, editor, initialContent]);

  if (!editor) {
    return <div className="p-4 border border-gray-800 text-xs font-mono text-gray-500 min-h-[250px] flex items-center justify-center">LOADING VISUAL EDITOR...</div>;
  }

  return (
    <div className="w-full min-h-[250px] border border-gray-800 bg-black pt-4 pb-12">
      <BlockNoteView 
        editor={editor} 
        theme="dark" 
        onChange={async () => {
          const html = await editor.blocksToHTMLLossy(editor.document);
          onChange(html);
        }} 
      />
    </div>
  );
}
