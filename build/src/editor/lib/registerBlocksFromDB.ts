import type { Editor } from "grapesjs";
import api from "@/lib/api";

type BlockItem = {
  _id: string;
  label: string;
  category: string;
  html: string;
};

const withLightShell = (html: string) =>
  `<div class="w-full rounded-2xl bg-zinc-50 p-4 text-zinc-900 shadow-sm">${html}</div>`;

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
