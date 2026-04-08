/**
 * LayersPanel
 * -----------
 * Recursive component-tree view.
 * - ChevronRight rotates to point down when a row is expanded.
 * - Clicking the chevron toggles children without changing canvas selection.
 * - Clicking the row label selects the component on canvas.
 * - Rows with no children have no arrow (invisible slot kept for alignment).
 */

import { useEffect, useReducer, useState } from "react";
import type { Component } from "grapesjs";
import { ChevronRight, Box } from "lucide-react";
import { useGrapesEditor } from "@/editor/context/EditorContext";
import { cn } from "@/lib/utils";

function layerLabel(c: Component): string {
    const name = c.getName?.();
    if (name) return name;
    const tag = c.get("tagName") as string | undefined;
    if (tag) return tag.toLowerCase();
    const type = c.get("type") as string | undefined;
    return type || "box";
}

interface LayerRowProps {
    component: Component;
    depth: number;
    selectedId: string;
    onSelect: (c: Component) => void;
}

function LayerRow({ component, depth, selectedId, onSelect }: LayerRowProps) {
    const id = component.getId?.() ?? "";
    const children = component.components()?.models ?? [];
    const hasChildren = children.length > 0;
    const isSelected = id === selectedId;

    // Each row manages its own open/collapse state; default open at depth 0
    const [open, setOpen] = useState(depth === 0);

    return (
        <div className="select-none">
            <div
                style={{ paddingLeft: 8 + depth * 14 }}
                className={cn(
                    "flex w-full items-center gap-1 border-b border-border pr-2 transition-colors hover:bg-accent",
                    isSelected && "bg-primary/10 text-primary",
                )}
            >
                {/* ── Chevron toggle ── */}
                <button
                    type="button"
                    aria-label={open ? "Collapse" : "Expand"}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) setOpen((o) => !o);
                    }}
                    className={cn(
                        "flex shrink-0 items-center justify-center rounded p-0.5 transition-transform duration-150",
                        hasChildren
                            ? "text-muted-foreground hover:text-foreground"
                            : "pointer-events-none opacity-0",
                        open && hasChildren && "rotate-90",
                    )}
                >
                    <ChevronRight className="size-3" />
                </button>

                {/* ── Row label — selects on canvas ── */}
                <button
                    type="button"
                    onClick={() => onSelect(component)}
                    className="flex flex-1 items-center gap-1.5 py-1.5 text-left text-xs"
                >
                    <Box className="size-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate font-medium">
                        {layerLabel(component)}
                    </span>
                    <span className="ml-auto truncate text-[10px] text-muted-foreground">
                        {id.slice(0, 8)}…
                    </span>
                </button>
            </div>

            {/* ── Children (only when expanded) ── */}
            {open &&
                hasChildren &&
                children.map((child) => (
                    <LayerRow
                        key={child.getId?.() ?? String(child.cid)}
                        component={child}
                        depth={depth + 1}
                        selectedId={selectedId}
                        onSelect={onSelect}
                    />
                ))}
        </div>
    );
}

export function LayersPanel() {
    const { editor, isReady } = useGrapesEditor();
    const [, refresh] = useReducer((x: number) => x + 1, 0);

    useEffect(() => {
        if (!editor) return;
        const run = () => refresh();
        editor.on("component:add", run);
        editor.on("component:remove", run);
        editor.on("component:update", run);
        editor.on("component:selected", run);
        return () => {
            editor.off("component:add", run);
            editor.off("component:remove", run);
            editor.off("component:update", run);
            editor.off("component:selected", run);
        };
    }, [editor]);

    if (!isReady || !editor) {
        return (
            <p className="px-3 py-4 text-xs text-muted-foreground">
                Open a project to see layers.
            </p>
        );
    }

    const wrapper = editor.getWrapper();
    const roots = wrapper?.components()?.models ?? [];
    const selected = editor.getSelected();
    const selectedId = selected?.getId?.() ?? "";

    return (
        <div className="text-foreground">
            {roots.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted-foreground">
                    No components on canvas yet.
                </p>
            ) : (
                roots.map((c) => (
                    <LayerRow
                        key={c.getId?.() ?? String(c.cid)}
                        component={c}
                        depth={0}
                        selectedId={selectedId}
                        onSelect={(cmp) => editor.select(cmp)}
                    />
                ))
            )}
        </div>
    );
}
