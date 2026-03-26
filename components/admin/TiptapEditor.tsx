"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function ToolbarButton({
  label,
  onClick,
  isActive = false,
}: {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-w-[42px] items-center justify-center border px-3 py-2 text-sm transition ${
        isActive
          ? "border-[#4b3226] bg-[#4b3226] text-white"
          : "border-[#d8c6b5] bg-white text-[#4b3226] hover:bg-[#f8f4ef]"
      }`}
    >
      {label}
    </button>
  );
}

export default function TiptapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] focus:outline-none px-4 py-4 text-[16px] leading-[1.8] text-[#4b3226]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

 function setLink() {
  if (!editor) return;

  const previousUrl = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("Enter URL", previousUrl || "https://");

  if (url === null) return;

  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

  return (
    <div className="mt-3 overflow-hidden border border-[#d8c6b5] bg-white">
      <div className="flex flex-wrap gap-2 border-b border-[#e7d9ca] bg-[#fcfaf7] p-3">
        <ToolbarButton
          label="B"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        />
        <ToolbarButton
          label="I"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        />
        <ToolbarButton
          label="U"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
        />
        <ToolbarButton
          label="H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
        />
        <ToolbarButton
          label="H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
        />
        <ToolbarButton
          label="• List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        />
        <ToolbarButton
          label="1. List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        />
        <ToolbarButton
          label="Link"
          onClick={setLink}
          isActive={editor.isActive("link")}
        />
        <ToolbarButton
          label="Clear"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        />
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror p {
          margin: 0 0 1rem 0;
        }

        .ProseMirror h2 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1.75rem;
          line-height: 1.1;
          color: #4b3226;
        }

        .ProseMirror h3 {
          margin: 1.25rem 0 0.75rem;
          font-size: 1.3rem;
          line-height: 1.15;
          color: #4b3226;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0 0 1rem 0;
        }

        .ProseMirror li {
          margin: 0.35rem 0;
        }

        .ProseMirror a {
          color: #4b3226;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}