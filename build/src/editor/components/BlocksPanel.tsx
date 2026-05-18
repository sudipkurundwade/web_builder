/**
 * BlocksPanel
 * ----------
 * Professional block catalog grouped by category.
 * Provides both Click-to-Add and Drag-and-Drop functionality.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid2X2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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

interface BlockCardProps {
    block: CatalogBlock;
    onAdd: (html: string) => void;
    onDragStart: (e: React.DragEvent, block: CatalogBlock) => void;
    disabled: boolean;
    compact?: boolean;
}

const preferredQuickCategories = ["Basic", "Text", "Media", "Layout"];
const quickBlockKeywords = ["text", "image", "button", "hero", "navbar", "grid", "theme", "toggle"];
const quickBlockLimit = 6;

function normalizeText(value: string) {
    return value.toLowerCase().trim();
}

function BlockCard({ block, onAdd, onDragStart, disabled, compact = false }: BlockCardProps) {
    return (
        <Card
            draggable={!disabled}
            onDragStart={(e) => onDragStart(e, block)}
            className={cn(
                "group border-muted bg-background/60 transition hover:border-primary/50",
                !disabled && "cursor-grab active:cursor-grabbing",
            )}
        >
            <button
                type="button"
                disabled={disabled}
                onClick={() => onAdd(block.html)}
                className="flex w-full flex-col items-stretch text-left"
            >
                <CardHeader className={cn("space-y-1 font-sans", compact ? "p-3" : "pb-2")}>
                    <CardTitle className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
                        {block.label}
                    </CardTitle>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">
                        {block.description}
                    </p>
                </CardHeader>
                {!compact && block.preview && (
                    <CardContent className="pb-3">
                        <div className="h-16 w-full overflow-hidden rounded-md border bg-muted/40 text-[9px] text-muted-foreground">
                            <div className="flex h-full items-center justify-center px-2 text-center pointer-events-none select-none">
                                {block.preview}
                            </div>
                        </div>
                    </CardContent>
                )}
            </button>
        </Card>
    );
}

function CategorySection({ title, blocks, onAdd, onDragStart, disabled }: CategoryProps) {
    if (!blocks.length) return null;
    return (
        <section className="space-y-2">
            <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
            </h3>
            <div className="grid grid-cols-1 gap-2">
                {blocks.map((block) => (
                    <BlockCard
                        key={block.id}
                        block={block}
                        onAdd={onAdd}
                        onDragStart={onDragStart}
                        disabled={disabled}
                    />
                ))}
            </div>
        </section>
    );
}

export function BlocksPanel() {
    const { editor, isReady } = useGrapesEditor();
    const [blocks, setBlocks] = useState<CatalogBlock[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

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

    const handleLibraryAdd = useCallback(
        (html: string) => {
            handleAdd(html);
            setIsLibraryOpen(false);
        },
        [handleAdd],
    );

    const handleLibraryDragStart = useCallback(
        (e: React.DragEvent, blockItem: CatalogBlock) => {
            setIsLibraryOpen(false);
            handleDragStart(e, blockItem);
        },
        [handleDragStart],
    );

    const disabled = !isReady || !editor;
    const categories = useMemo(() => {
        return ["All", ...Array.from(new Set(blocks.map((block) => block.category))).sort((a, b) => a.localeCompare(b))];
    }, [blocks]);
    const quickBlocks = useMemo(() => {
        const scored = blocks.map((block, index) => {
            const label = normalizeText(block.label);
            const category = normalizeText(block.category);
            const categoryScore = preferredQuickCategories.some((item) => normalizeText(item) === category) ? 3 : 0;
            const keywordScore = quickBlockKeywords.some((keyword) => label.includes(keyword)) ? 2 : 0;
            return { block, index, score: categoryScore + keywordScore };
        });

        return scored
            .sort((a, b) => b.score - a.score || a.index - b.index)
            .slice(0, quickBlockLimit)
            .map(({ block }) => block);
    }, [blocks]);
    const filteredBlocks = useMemo(() => {
        const q = normalizeText(query);
        return blocks.filter((block) => {
            const matchesCategory = activeCategory === "All" || block.category === activeCategory;
            const matchesSearch = !q || [block.label, block.description, block.category].some((value) => normalizeText(value).includes(q));
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, blocks, query]);
    const groupedBlocks = useMemo(() => {
        return filteredBlocks.reduce<Record<string, CatalogBlock[]>>((acc, block) => {
            const key = block.category;
            if (!acc[key]) acc[key] = [];
            acc[key].push(block);
            return acc;
        }, {});
    }, [filteredBlocks]);
    const groupedEntries = Object.entries(groupedBlocks).sort(([a], [b]) => a.localeCompare(b));

    return (
        <>
            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-4 p-2">
                    <div className="space-y-1 px-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Quick blocks
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            Common elements stay here. Open the library for the full catalog.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {quickBlocks.map((block) => (
                            <BlockCard
                                key={block.id}
                                block={block}
                                onAdd={handleAdd}
                                onDragStart={handleDragStart}
                                disabled={disabled}
                                compact
                            />
                        ))}
                    </div>

                    {!blocks.length && (
                        <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                            No blocks loaded yet. Ensure you are logged in and block seed data exists.
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || !blocks.length}
                        className="h-8 w-full justify-center gap-2 text-xs"
                        onClick={() => setIsLibraryOpen(true)}
                    >
                        <Grid2X2 className="size-3.5" />
                        More blocks
                    </Button>
                </div>
            </ScrollArea>

            <Sheet open={isLibraryOpen} onOpenChange={setIsLibraryOpen} modal={false}>
                <SheetContent side="left" className="flex w-[420px] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[520px]">
                    <SheetHeader className="border-b px-4 py-3 text-left">
                        <SheetTitle className="text-base">Block Library</SheetTitle>
                        <SheetDescription>
                            Search, filter, drag, or click any component into the canvas.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="shrink-0 space-y-3 border-b p-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search blocks"
                                className="h-8 pl-8 text-xs"
                            />
                        </div>
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex gap-1 pb-1">
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        type="button"
                                        variant={activeCategory === category ? "default" : "outline"}
                                        size="sm"
                                        className="h-7 px-2 text-[11px]"
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <ScrollArea className="min-h-0 flex-1">
                        <div className="space-y-5 p-3">
                            {groupedEntries.map(([title, categoryBlocks]) => (
                                <CategorySection
                                    key={title}
                                    title={title}
                                    blocks={categoryBlocks}
                                    onAdd={handleLibraryAdd}
                                    onDragStart={handleLibraryDragStart}
                                    disabled={disabled}
                                />
                            ))}
                            {!groupedEntries.length && (
                                <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                                    No blocks match your current filters.
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="flex shrink-0 items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
                        <span>{filteredBlocks.length} of {blocks.length} blocks</span>
                        <Button type="button" size="sm" className="h-7 gap-1.5" disabled>
                            <Plus className="size-3.5" />
                            Custom block
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
