"use client";
import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Link2Off, ImagePlus, Undo2, Redo2, Pilcrow } from "lucide-react";
import { MediaPickerModal } from "@/components/admin/MediaPicker";
import { cn } from "@/lib/utils";

function Btn({ on, label, onClick, children, disabled }: { on?: boolean; label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={on} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md transition disabled:opacity-35", on ? "bg-[#1B2438] text-[#F6F4EF]" : "text-[#4A4B45] hover:bg-[#F1EEE7]")}>
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://… or /page)", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(url.trim())) { window.alert("Use a full link starting with https://, or a site path like /services"); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };
  const sep = <span className="mx-1 h-5 w-px shrink-0 bg-[#E4DFD5]" />;
  return (
    <div className="sticky top-14 z-10 flex items-center gap-0.5 overflow-x-auto border-b border-[#E4DFD5] bg-white/95 px-2 py-1.5 backdrop-blur lg:top-0" role="toolbar" aria-label="Formatting">
      <Btn label="Paragraph" on={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow size={15} /></Btn>
      <Btn label="Heading 2" on={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
      <Btn label="Heading 3" on={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></Btn>
      {sep}
      <Btn label="Bold" on={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></Btn>
      <Btn label="Italic" on={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></Btn>
      {sep}
      <Btn label="Bulleted list" on={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Btn>
      <Btn label="Numbered list" on={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
      <Btn label="Quote" on={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} /></Btn>
      {sep}
      <Btn label="Add link" on={editor.isActive("link")} onClick={setLink}><Link2 size={15} /></Btn>
      <Btn label="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}><Link2Off size={15} /></Btn>
      <Btn label="Insert image" onClick={onImage}><ImagePlus size={15} /></Btn>
      {sep}
      <Btn label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={15} /></Btn>
      <Btn label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={15} /></Btn>
    </div>
  );
}

export function RichTextEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [html, setHtml] = useState(defaultValue);
  const [picker, setPicker] = useState(false);
  const [, force] = useState(0);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, code: false, horizontalRule: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["mailto", "tel"], HTMLAttributes: { rel: null, target: null } }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Start writing… Use H2 for section headings." }),
    ],
    content: defaultValue,
    editorProps: { attributes: { class: "adm-prose min-h-[420px] px-5 py-6 sm:px-8 sm:py-8", "aria-label": "Article body", "data-testid": "rte" } },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
    onSelectionUpdate: () => force((n) => n + 1),
    onTransaction: () => force((n) => n + 1),
  });
  useEffect(() => () => editor?.destroy(), [editor]);
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return (
    <div className="overflow-hidden rounded-[10px] border border-[#D6D0C4] bg-white focus-within:border-[#1B2438]">
      <input type="hidden" name={name} value={html} />
      {editor ? <Toolbar editor={editor} onImage={() => setPicker(true)} /> : <div className="h-[45px] border-b border-[#E4DFD5]" />}
      <EditorContent editor={editor} />
      <div className="flex justify-between border-t border-[#E4DFD5] bg-[#FCFBF8] px-4 py-2 text-[11.5px] adm-muted">
        <span>{words} words</span><span>~{Math.max(1, Math.round(words / 220))} min read</span>
      </div>
      <MediaPickerModal open={picker} title="Insert an image" onClose={() => setPicker(false)}
        onPick={([r]) => { setPicker(false); editor?.chain().focus().setImage({ src: r.public_url, alt: r.alt_text ?? "" }).run(); }} />
    </div>
  );
}
