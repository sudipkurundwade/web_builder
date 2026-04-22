/**
 * PagesPanel
 * ----------
 * Lightweight wrapper around GrapesJS Pages API.
 * Lists pages, allows adding, renaming (pencil icon on hover), and selecting.
 * New pages are auto-named "Page 1", "Page 2", … based on total count.
 */

import { useCallback, useEffect, useReducer, useState } from "react";
import type { Page } from "grapesjs";
import { Plus, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGrapesEditor } from "@/editor/context/EditorContext";

export function PagesPanel() {
    const { editor, isReady, currentPageId, setCurrentPage } = useGrapesEditor();
    const [, force] = useReducer((x: number) => x + 1, 0);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!editor) return;
        const rerender = () => force();
        editor.on("page:add", rerender);
        editor.on("page:remove", rerender);
        editor.on("page:update", rerender);
        editor.on("page:select", rerender);
        return () => {
            editor.off("page:add", rerender);
            editor.off("page:remove", rerender);
            editor.off("page:update", rerender);
            editor.off("page:select", rerender);
        };
    }, [editor]);

    const handleAdd = useCallback(() => {
        if (!editor) return;
        const id = `page-${Date.now()}`;
        // Auto-number: "Page 1", "Page 2", … based on current total
        const pageNumber = editor.Pages.getAll().length + 1;
        const page = editor.Pages.add({ id, name: `Page ${pageNumber}` }) as Page;
        editor.Pages.select(page);
        setCurrentPage(page);
        setAdding(false);
    }, [editor, setCurrentPage]);

    if (!isReady || !editor) {
        return (
            <p className="px-3 py-4 text-xs text-muted-foreground">
                Editor not ready. Open a project to manage pages.
            </p>
        );
    }

    const pages = editor.Pages.getAll();

    return (
        <div className="space-y-3 p-2 text-xs">
            <div className="flex items-center justify-between gap-2 px-1">
                <span className="font-semibold text-muted-foreground">Pages</span>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setAdding(true)}
                >
                    <Plus className="size-3" />
                </Button>
            </div>

            <div className="space-y-1">
                {pages.map((page: Page) => {
                    const id = page.get("id") as string;
                    const name = (page.get("name") as string) ?? id;
                    const selected = currentPageId === id;
                    return (
                        <PageRow
                            key={id}
                            page={page}
                            name={name}
                            selected={selected}
                            onSelect={() => {
                                editor.Pages.select(page);
                                setCurrentPage(page);
                            }}
                        />
                    );
                })}
            </div>

            {adding && (
                <div className="mt-2 space-y-1 rounded-md border bg-background p-2">
                    <p className="text-[11px] text-muted-foreground">
                        A new page will be created with an empty canvas.
                    </p>
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            size="sm"
                            className="h-7 flex-1 text-[11px]"
                            onClick={handleAdd}
                        >
                            Create page
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 flex-1 text-[11px]"
                            onClick={() => setAdding(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface PageRowProps {
    page: Page;
    name: string;
    selected: boolean;
    onSelect: () => void;
}

function PageRow({ page, name, selected, onSelect }: PageRowProps) {
    const [editing, setEditing] = useState(false);
    const [draftName, setDraftName] = useState(name);
    const [hovered, setHovered] = useState(false);

    const commit = () => {
        const next = draftName.trim();
        if (next && next !== name) {
            page.set("name", next);
        }
        setEditing(false);
    };

    const startEditing = (e: React.MouseEvent) => {
        e.stopPropagation(); // don't trigger onSelect
        setDraftName(name);  // reset draft to current saved name
        setEditing(true);
    };

    return (
        <button
            type="button"
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={[
                "group flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left",
                selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent bg-transparent hover:bg-accent",
            ].join(" ")}
        >
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />

            {editing ? (
                /* ── Inline rename input ── */
                <Input
                    value={draftName}
                    autoFocus
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={commit}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") commit();
                        if (e.key === "Escape") setEditing(false);
                    }}
                    className="h-6 flex-1 border-none bg-transparent p-0 text-xs focus-visible:ring-0"
                />
            ) : (
                <>
                    <span className="flex-1 truncate text-[11px]">{name}</span>

                    {/* ── Pencil icon: visible on row hover or when selected ── */}
                    {(hovered || selected) && (
                        <span
                            role="button"
                            aria-label="Rename page"
                            title="Rename page"
                            onClick={startEditing}
                            className="ml-auto flex shrink-0 items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Pencil className="size-2.5" />
                        </span>
                    )}
                </>
            )}
        </button>
    );
}
