import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TipTapImage from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import CharacterCount from "@tiptap/extension-character-count";
import DOMPurify from "dompurify";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Link2, Unlink, Image as ImageIcon, Youtube as YoutubeIcon,
  AlignLeft, AlignCenter, AlignRight, Highlighter, Minus, Undo2, Redo2, Palette,
  Loader2, Eraser,
} from "lucide-react";

/* ==================================================================
   RichTextEditor - a Google-Docs-style editor for stories.

   Install once:
     npm i @tiptap/react@^2 @tiptap/pm@^2 @tiptap/starter-kit@^2 \
       @tiptap/extension-underline@^2 @tiptap/extension-link@^2 \
       @tiptap/extension-image@^2 @tiptap/extension-youtube@^2 \
       @tiptap/extension-text-align@^2 @tiptap/extension-placeholder@^2 \
       @tiptap/extension-highlight@^2 @tiptap/extension-text-style@^2 \
       @tiptap/extension-color@^2 @tiptap/extension-character-count@^2 \
       dompurify

   Use:
     <RichTextEditor value={html} onChange={setHtml}
                     onUploadImage={async (file) => urlString} />

   Show a saved story to visitors (sanitised):
     <StoryContent html={blog.content} />
================================================================== */

const MAX_IMAGE_MB = 10;

/* ---------- shared typography for editor + reader ---------- */
const PROSE_CSS = `
.rt-prose { font-size: 1.0625rem; line-height: 1.8; color: #1e293b; word-wrap: break-word; }
.rt-prose > * + * { margin-top: 1rem; }
.rt-prose h2 { font-size: 1.6rem; line-height: 1.3; font-weight: 700; margin-top: 2rem; color: #0f172a; }
.rt-prose h3 { font-size: 1.25rem; line-height: 1.35; font-weight: 700; margin-top: 1.5rem; color: #0f172a; }
.rt-prose ul { list-style: disc; padding-left: 1.5rem; }
.rt-prose ol { list-style: decimal; padding-left: 1.5rem; }
.rt-prose li + li { margin-top: .25rem; }
.rt-prose li > p { margin: 0; }
.rt-prose blockquote { border-left: 4px solid #ea580c; background: #fff7ed; padding: .75rem 1rem; border-radius: 0 .5rem .5rem 0; font-style: italic; color: #475569; }
.rt-prose a { color: #c2410c; text-decoration: underline; text-underline-offset: 2px; }
.rt-prose hr { border: 0; border-top: 2px solid #e2e8f0; margin: 2rem 0; }
.rt-prose img { display: block; margin: 1.25rem auto; border-radius: .75rem; height: auto; max-width: 100%; }
.rt-prose img.ProseMirror-selectednode { outline: 3px solid #f97316; outline-offset: 2px; }
.rt-prose div[data-youtube-video] { margin: 1.25rem 0; }
.rt-prose iframe { width: 100%; aspect-ratio: 16 / 9; height: auto; border: 0; border-radius: .75rem; display: block; }
.rt-prose mark { background: #fde68a; padding: 0 .15em; border-radius: .2em; }
.rt-prose p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #94a3b8; float: left; height: 0; pointer-events: none; }
.rt-prose .ProseMirror { outline: none; min-height: 380px; }
`;

/* ---------- safe HTML for visitors ---------- */
if (typeof window !== "undefined" && !DOMPurify.__rtHooked) {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.nodeName === "IFRAME") {
      const src = node.getAttribute("src") || "";
      // only YouTube embeds may survive
      if (!/^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\//.test(src) && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    if (node.nodeName === "A") {
      node.setAttribute("rel", "noopener noreferrer nofollow");
      if (node.getAttribute("target")) node.setAttribute("target", "_blank");
    }
  });
  DOMPurify.__rtHooked = true;
}
export function sanitizeStoryHtml(html) {
  return DOMPurify.sanitize(html || "", {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target", "data-youtube-video"],
  });
}

/** Render saved story HTML to visitors, with the same look as the editor. */
export function StoryContent({ html, className = "" }) {
  const clean = useMemo(() => {
    const raw = html || "";
    // stories written before the rich editor are plain text: keep their paragraphs
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
    const source = looksLikeHtml
      ? raw
      : raw
          .split(/\n{2,}/)
          .map((p) => `<p>${p.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace(/\n/g, "<br>")}</p>`)
          .join("");
    return sanitizeStoryHtml(source);
  }, [html]);
  return (
    <>
      <style>{PROSE_CSS}</style>
      <div className={`rt-prose ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />
    </>
  );
}

/* ---------- image helpers ---------- */
// Fallback when no upload function is given: shrink to max 1400px and embed.
function fileToDataUrl(file, maxW = 1400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not a valid image."));
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Image node with a saved width (25% / 50% / 100%)
const SizedImage = TipTapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (el) => el.style.width || el.getAttribute("width") || "100%",
        renderHTML: (attrs) => ({ style: `width:${attrs.width};max-width:100%;height:auto;` }),
      },
    };
  },
});

/* ---------- toolbar bits ---------- */
function Btn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
      className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-slate-600 transition-colors disabled:opacity-30 ${
        active ? "bg-orange-100 text-orange-700" : "hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
const Sep = () => <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />;

/* ================================================================== */

export default function RichTextEditor({
  value = "",
  onChange,
  onUploadImage, // optional: async (file) => publicUrl
  placeholder = "Start writing your story… Use the toolbar to add headings, photos and YouTube videos.",
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const editorRef = useRef(null);
  const uploadRef = useRef(onUploadImage);
  uploadRef.current = onUploadImage;

  async function insertImageFiles(files) {
    const images = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setUploading(true);
    setError("");
    try {
      for (const f of images) {
        if (f.size > MAX_IMAGE_MB * 1024 * 1024) throw new Error(`"${f.name}" is bigger than ${MAX_IMAGE_MB} MB.`);
        const src = uploadRef.current ? await uploadRef.current(f) : await fileToDataUrl(f);
        editorRef.current
          ?.chain()
          .focus()
          .setImage({ src, alt: f.name.replace(/\.[^.]+$/, "") })
          .run();
      }
    } catch (e) {
      setError(e.message || "Image upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      SizedImage.configure({ inline: false }),
      Youtube.configure({ nocookie: true, controls: true, width: 640, height: 360 }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => onChange?.(ed.isEmpty ? "" : ed.getHTML()),
    editorProps: {
      attributes: { class: "focus:outline-none" },
      // paste or drag a photo straight into the story
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files;
        if (files && files.length && Array.from(files).some((f) => f.type.startsWith("image/"))) {
          insertImageFiles(files);
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length && Array.from(files).some((f) => f.type.startsWith("image/"))) {
          event.preventDefault();
          insertImageFiles(files);
          return true;
        }
        return false;
      },
    },
  });
  editorRef.current = editor;

  // when a different story is opened for editing, load its content
  useEffect(() => {
    if (!editor) return;
    if ((value || "") !== (editor.isEmpty ? "" : editor.getHTML())) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href || "";
    const input = window.prompt("Link address (leave empty to remove):", prev);
    if (input === null) return;
    if (input.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^(https?:|mailto:|tel:)/i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const addYoutube = () => {
    setError("");
    const url = window.prompt("Paste a YouTube link:");
    if (!url) return;
    if (!/(youtube\.com|youtu\.be)/i.test(url)) {
      setError("That doesn't look like a YouTube link.");
      return;
    }
    editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  const addImageByUrl = () => {
    const url = window.prompt("Image address (https://…):");
    if (url && /^https?:\/\//i.test(url.trim())) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  };

  const editAlt = () => {
    const cur = editor.getAttributes("image").alt || "";
    const alt = window.prompt("Describe this photo (helps screen readers and search):", cur);
    if (alt !== null) editor.chain().focus().updateAttributes("image", { alt }).run();
  };

  const imageSelected = editor.isActive("image");
  const words = editor.storage.characterCount.words();

  return (
    <div className="border border-slate-300 rounded-xl bg-white overflow-hidden">
      <style>{PROSE_CSS}</style>

      {/* toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-50 border-b border-slate-200">
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo2 size={16} /></Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo2 size={16} /></Btn>
        <Sep />
        <Btn title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></Btn>
        <Btn title="Sub-heading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></Btn>
        <Sep />
        <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Btn>
        <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Btn>
        <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></Btn>
        <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></Btn>
        <Btn title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter size={16} /></Btn>
        <label
          title="Text colour"
          className="relative w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <Palette size={16} style={{ color: editor.getAttributes("textStyle").color || undefined }} />
          <input
            type="color"
            aria-label="Text colour"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <Btn title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><Eraser size={16} /></Btn>
        <Sep />
        <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={17} /></Btn>
        <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></Btn>
        <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Btn>
        <Btn title="Divider line" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></Btn>
        <Sep />
        <Btn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={16} /></Btn>
        <Btn title="Align centre" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={16} /></Btn>
        <Btn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={16} /></Btn>
        <Sep />
        <Btn title="Add link" active={editor.isActive("link")} onClick={setLink}><Link2 size={16} /></Btn>
        <Btn title="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}><Unlink size={16} /></Btn>
        <Sep />
        <Btn title="Upload photo" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        </Btn>
        <Btn title="YouTube video" onClick={addYoutube}><YoutubeIcon size={17} /></Btn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            insertImageFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* photo tools appear only when a photo is selected */}
      {imageSelected && (
        <div className="flex items-center gap-2 flex-wrap px-3 py-1.5 bg-orange-50 border-b border-orange-100 text-xs text-orange-900">
          <span className="font-semibold">Photo size:</span>
          {[["Small", "35%"], ["Medium", "60%"], ["Full width", "100%"]].map(([label, w]) => (
            <button
              key={w}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().updateAttributes("image", { width: w }).run()}
              className={`px-2.5 py-1 rounded-full font-semibold ${
                editor.getAttributes("image").width === w ? "bg-orange-600 text-white" : "bg-white border border-orange-200 hover:bg-orange-100"
              }`}
            >
              {label}
            </button>
          ))}
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={editAlt} className="px-2.5 py-1 rounded-full bg-white border border-orange-200 hover:bg-orange-100 font-semibold">
            Add description
          </button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().deleteSelection().run()} className="ml-auto px-2.5 py-1 rounded-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold">
            Delete photo
          </button>
        </div>
      )}

      {/* writing area */}
      <div className="rt-prose px-5 py-4 max-h-[70vh] overflow-y-auto" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      {/* footer */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        <span>
          {words} {words === 1 ? "word" : "words"} · about {Math.max(1, Math.ceil(words / 200))} min read
        </span>
        <span className="hidden sm:inline">Tip: paste or drag photos straight into the story</span>
        {!onUploadImage && (
          <span className="text-amber-600">Photos are saved inside the story (no upload server set)</span>
        )}
      </div>
      {error && <p className="px-3 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">{error}</p>}
    </div>
  );
}