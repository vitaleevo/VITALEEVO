"use client";

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto',
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false, // Fix Hydration Error in React 19/Nextjs
    });

    // Update content if value changes externally (e.g. form reset)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL do link:', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt('URL da imagem:');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        title
    }: {
        onClick: () => void,
        isActive?: boolean,
        children: React.ReactNode,
        title?: string
    }) => (
        <button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={`p-2 rounded-lg transition-colors ${isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-white/10 bg-gray-100/50 dark:bg-black/20">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Negrito"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Itálico"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Tachado"
                >
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Título 1"
                >
                    <Heading1 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Título 2"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Título 3"
                >
                    <Heading3 className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Lista com Marcadores"
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Lista Numerada"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Citação"
                >
                    <Quote className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />

                <ToolbarButton
                    onClick={addLink}
                    isActive={editor.isActive('link')}
                    title="Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={addImage}
                    title="Imagem"
                >
                    <ImageIcon className="w-4 h-4" />
                </ToolbarButton>

                <div className="flex-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Desfazer"
                >
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Refazer"
                >
                    <Redo className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
