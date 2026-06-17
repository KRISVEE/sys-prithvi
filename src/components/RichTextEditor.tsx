"use client";

import { useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

// Need to dynamically import Quill to avoid Next.js window is not defined error
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const Quill = (await import("react-quill")).Quill;
    
    // Register Image Resize Module
    if (typeof window !== "undefined") {
      (window as any).Quill = Quill; // Provide window.Quill for the module
      const { default: ImageResize } = await import("quill-image-resize-module-react");
      Quill.register("modules/imageResize", ImageResize);
    }

    return function ForwardedReactQuill({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false, loading: () => <div className="p-4 border border-gray-800 text-xs font-mono text-gray-500 h-64 flex items-center justify-center">LOADING VISUAL EDITOR...</div> }
);

import "react-quill/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const quillRef = useRef<any>(null);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const quillObj = quillRef.current?.getEditor();
      if (!quillObj) return;

      const range = quillObj.getSelection();
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload to Supabase vault-assets bucket
      const { error } = await supabase.storage
        .from("vault-assets")
        .upload(fileName, file);

      if (error) {
        alert("Image upload failed! Ensure 'vault-assets' bucket exists and RLS allows inserts. Error: " + error.message);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("vault-assets").getPublicUrl(fileName);
      
      // Insert image at cursor
      if (range) {
        quillObj.insertEmbed(range.index, "image", urlData.publicUrl);
        quillObj.setSelection(range.index + 1);
      } else {
        quillObj.insertEmbed(0, "image", urlData.publicUrl);
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    imageResize: {
      parchment: typeof window !== "undefined" ? (window as any).Quill?.import('parchment') : null,
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  }), []);

  return (
    <div className="w-full text-white bg-black terminal-quill-wrapper">
      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />
    </div>
  );
}
