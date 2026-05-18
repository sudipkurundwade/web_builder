import type { Editor } from "grapesjs";
import api from "@/lib/api";
import {
  BLOCKS_BASIC,
  BLOCKS_FORMS,
  BLOCKS_LAYOUT,
  BLOCKS_MEDIA,
} from "@/editor/lib/blockTemplates";

type BlockItem = {
  _id: string;
  label: string;
  category: string;
  html: string;
};

const withLightShell = (html: string) =>
  `<div class="w-full rounded-2xl bg-zinc-50 p-4 text-zinc-900 shadow-sm">${html}</div>`;

const localBlockGroups = [
  { category: "Layout", blocks: BLOCKS_LAYOUT },
  { category: "Basic", blocks: BLOCKS_BASIC },
  { category: "Media", blocks: BLOCKS_MEDIA },
  { category: "Forms", blocks: BLOCKS_FORMS },
] as const;

export const registerLocalBlocks = (editor: Editor) => {
  if (!editor || !editor.Blocks) return;

  localBlockGroups.forEach(({ category, blocks }) => {
    blocks.forEach((block) => {
      if (editor.Blocks.get(block.id)) return;
      editor.Blocks.add(block.id, {
        label: block.label,
        category,
        content: block.html,
      });
    });
  });
};

export const registerBlocksFromDB = async (editor: Editor, token: string) => {
  const [uiRes, pageRes] = await Promise.all([
    api.get<{ data: Record<string, BlockItem[]> }>("/blocks/ui", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
    api.get<{ data: Record<string, BlockItem[]> }>("/blocks/page", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  ]);
  const uiGroups = uiRes.data.data;
  const pageGroups = pageRes.data.data;

  // If the editor was destroyed while fetching (e.g., React StrictMode unmount), return early.
  if (!editor || !editor.Blocks) return;

  Object.entries(uiGroups).forEach(([category, blocks]) => {
    blocks.forEach((block) => {
      editor.Blocks.add(block._id, {
        label: block.label,
        category: `UI – ${category}`,
        content: withLightShell(block.html),
      });
    });
  });

  Object.entries(pageGroups).forEach(([category, blocks]) => {
    blocks.forEach((block) => {
      editor.Blocks.add(block._id, {
        label: block.label,
        category: `Pages – ${category}`,
        content: withLightShell(block.html),
      });
    });
  });
};
