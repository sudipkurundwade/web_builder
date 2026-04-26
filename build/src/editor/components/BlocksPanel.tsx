/**
 * BlocksPanel
 * ----------
 * Professional block catalog grouped by category.
 * Provides both Click-to-Add and Drag-and-Drop functionality.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGrapesEditor } from "@/editor/context/EditorContext";
import { cn } from "@/lib/utils";

type CatalogBlock = {
    id: string;
    label: string;
    description: string;
    html: string;
    category: string;
    preview?: string;
};

interface CategoryProps {
    title: string;
    blocks: readonly CatalogBlock[];
    onAdd: (html: string) => void;
    onDragStart: (e: React.DragEvent, block: CatalogBlock) => void;
    disabled: boolean;
}

function CategorySection({ title, blocks, onAdd, onDragStart, disabled }: CategoryProps) {
    if (!blocks.length) return null;
    return (
        <section className="space-y-2">
            <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
            </h3>
            <div className="grid grid-cols-1 gap-2">
                {blocks.map((b) => (
                    <Card
                        key={b.id}
                        draggable={!disabled}
                        onDragStart={(e) => onDragStart(e, b)}
                        className={cn(
                            "group border-muted bg-background/60 transition hover:border-primary/50",
                            !disabled && "cursor-grab active:cursor-grabbing",
                        )}
                    >
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onAdd(b.html)}
                            className="flex w-full flex-col items-stretch text-left"
                        >
                            <CardHeader className="space-y-1 pb-2 font-sans">
                                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                                    {b.label}
                                </CardTitle>
                                <p className="text-[11px] text-muted-foreground">
                                    {b.description}
                                </p>
                            </CardHeader>
                            {b.preview && (
                                <CardContent className="pb-3">
                                    <div className="h-16 w-full overflow-hidden rounded-md border bg-muted/40 text-[9px] text-muted-foreground">
                                        <div className="flex h-full items-center justify-center px-2 text-center pointer-events-none select-none">
                                            {b.preview}
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </button>
                    </Card>
                ))}
            </div>
        </section>
    );
}

export function BlocksPanel() {
    const { editor, isReady } = useGrapesEditor();
    const [blocks, setBlocks] = useState<CatalogBlock[]>([]);

    useEffect(() => {
        if (!editor) return;

        const syncBlocks = () => {
            const collection = editor.Blocks.getAll() as unknown as { models?: any[] };
            const next = (collection.models || []).map((model) => {
                const attrs = model.attributes || {};
                return {
                    id: String(attrs.id || model.id),
                    label: String(attrs.label || "Untitled block"),
                    description: String(attrs.label || "Reusable block from library"),
                    html: String(attrs.content || ""),
                    category: String(attrs.category || "Other"),
                    preview: String(attrs.label || "Block preview"),
                };
            });
            setBlocks(next);
        };

        syncBlocks();
        editor.on("block:add", syncBlocks);
        editor.on("block:remove", syncBlocks);
        editor.on("block:update", syncBlocks);

        return () => {
            editor.off("block:add", syncBlocks);
            editor.off("block:remove", syncBlocks);
            editor.off("block:update", syncBlocks);
        };
    }, [editor]);

    const handleAdd = useCallback(
        (html: string) => {
            if (!editor) return;
            editor.addComponents(html);
        },
        [editor],
    );

    const handleDragStart = useCallback(
        (e: React.DragEvent, blockItem: CatalogBlock) => {
            if (!editor) return;

            // 1. Ensure block is registered in GrapesJS for "droppable" support
            let block = editor.Blocks.get(blockItem.id);
            if (!block) {
                block = editor.Blocks.add(blockItem.id, {
                    label: blockItem.label,
                    content: blockItem.html,
                });
            }

            // 2. Start the drag operation via GrapesJS
            // This enables live previews and drop points on the canvas
            if (editor.Blocks.startDrag) {
                editor.Blocks.startDrag(block, e.nativeEvent);
            } else {
                editor.runCommand("core:component-drag", {
                    component: blockItem.html,
                    event: e.nativeEvent,
                });
            }
        },
        [editor],
    );

    const disabled = !isReady || !editor;
    const groupedBlocks = useMemo(() => {
        return blocks.reduce<Record<string, CatalogBlock[]>>((acc, block) => {
            const key = block.category;
            if (!acc[key]) acc[key] = [];
            acc[key].push(block);
            return acc;
        }, {});
    }, [blocks]);
    const groupedEntries = Object.entries(groupedBlocks).sort(([a], [b]) => a.localeCompare(b));

    return (
        <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 p-2">
                {groupedEntries.map(([title, categoryBlocks]) => (
                    <CategorySection
                        key={title}
                        title={title}
                        blocks={categoryBlocks}
                        onAdd={handleAdd}
                        onDragStart={handleDragStart}
                        disabled={disabled}
                    />
                ))}
                {!groupedEntries.length && (
                    <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                        No blocks loaded yet. Ensure you are logged in and block seed data exists.
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled
                    className="mt-2 h-7 w-full text-[11px] text-muted-foreground"
                >
                    Custom block library (soon)
                </Button>
            </div>
        </ScrollArea>
    );
}
