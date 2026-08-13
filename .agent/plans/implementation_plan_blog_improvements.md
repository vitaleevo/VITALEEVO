---
description: Improved Blog Implementation Plan
---
# Improved Blog Implementation Plan

## Problem Analysis
The current blog implementation suffers from two main issues:
1.  **Frontend Rendering**: The single article page renders content as a "wall of text" because standard textareas do not preserve or generate HTML formatting (like paragraphs, line breaks, bolding) unless specifically handled. The CSS `prose` class expects proper HTML structure (`<p>`, `<h3>`, `<ul>`, etc.) to style content effectively.
2.  **Admin Experience**: The admin interface uses a basic `<textarea>` for content input. This prevents the user from formatting text (bold, italic, headers), creating lists, adding links, or aligning text, which are essential features for blog management.

## Proposed Solution

### 1. Integrate a Rich Text Editor (Admin)
We will replace the raw `<textarea>` in `src/app/admin/blog/page.tsx` with a Rich Text Editor (WYSIWYG). `React Quill` is a suitable choice as it is lightweight, easy to integrate, and provides the requested features (bold, italic, links, lists).

**Steps:**
1.  Install `react-quill`.
2.  Create a wrapper component for `react-quill` (to handle Next.js SSR requirements).
3.  Replace the 'Conteúdo Completo' textarea in the admin form with this new component.

### 2. Improve Frontend Rendering (Client)
We will update the article detail page (`src/app/blog/[slug]/page.tsx`) to ensure the HTML content is rendered beautifully.

**Steps:**
1.  Ensure the `dangerouslySetInnerHTML` is used inside a container with Tailwind Typography classes (`prose prose-lg dark:prose-invert`).
2.  Review the `prose` styling to ensure sensible defaults for margins, line heights, and link colors.
3.  Add handling for responsive images if they are embedded in the content.

## Workflow

1.  **Install Dependencies**: Run `npm install react-quill`.
2.  **Create Editor Component**: Create `src/shared/components/RichTextEditor.tsx`.
3.  **Update Admin Page**: Import and use `RichTextEditor` in `src/app/admin/blog/page.tsx`.
4.  **Verify Frontend**: Check `src/app/blog/[slug]/page.tsx` (it already uses `dangerouslySetInnerHTML`, so it should "just work" once the input is HTML).

## Note on Links
The Rich Text Editor includes a "Link" button that allows you to highlight text and insert a URL. This directly addresses the user's request to "colocar o link nos posts".
