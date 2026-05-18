/**
 * PagesPanel
 * ----------
 * Lightweight wrapper around GrapesJS Pages API.
 * Lists pages and supports add, rename, duplicate, delete, reorder, and slug editing.
 */

import { useCallback, useEffect, useReducer, useState, type ReactNode } from "react";
import type { Editor, Page } from "grapesjs";
import {
    ChevronDown,
    ChevronUp,
    Copy,
    FileText,
    Link2,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGrapesEditor } from "@/editor/context/EditorContext";

interface PageSeoSettings {
    slug: string;
    title: string;
    description: string;
    faviconUrl: string;
    ogImageUrl: string;
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const readPageSeo = (page: Page): PageSeoSettings => {
    const seo = (page.get("seo") as Partial<PageSeoSettings> | undefined) || {};
    return {
        slug: String(seo.slug || page.get("slug") || ""),
        title: String(seo.title || page.get("title") || ""),
        description: String(seo.description || page.get("description") || ""),
        faviconUrl: String(seo.faviconUrl || page.get("faviconUrl") || ""),
        ogImageUrl: String(seo.ogImageUrl || page.get("ogImageUrl") || ""),
    };
};

const writePageSeo = (page: Page, patch: Partial<PageSeoSettings>) => {
    const nextSeo = {
        ...readPageSeo(page),
        ...patch,
    };

    page.set("seo", nextSeo);
    Object.entries(nextSeo).forEach(([key, value]) => page.set(key, value));
};

const markEditorDirty = (editor: Editor) => {
    editor.trigger("change");
};

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
        const pageNumber = editor.Pages.getAll().length + 1;
        const name = `Page ${pageNumber}`;
        const slug = slugify(name);
        const page = editor.Pages.add({
            id: `page-${Date.now()}`,
            name,
            slug,
            seo: {
                slug,
                title: name,
                description: "",
                faviconUrl: "",
                ogImageUrl: "",
            },
        }) as Page;

        editor.Pages.select(page);
        setCurrentPage(page);
        markEditorDirty(editor);
        setAdding(false);
    }, [editor, setCurrentPage]);

    const handleDuplicate = useCallback((page: Page) => {
        if (!editor) return;

        editor.Pages.select(page);
        const name = `${String(page.get("name") || page.get("id") || "Page")} Copy`;
        const seo = readPageSeo(page);
        const slug = slugify(`${seo.slug || name}-copy`);
        const duplicatedPage = editor.Pages.add({
            id: `page-${Date.now()}`,
            name,
            slug,
            seo: {
                ...seo,
                slug,
                title: seo.title ? `${seo.title} Copy` : name,
            },
            component: editor.getHtml() || "<div></div>",
            styles: editor.getCss() || "",
        }) as Page;

        editor.Pages.select(duplicatedPage);
        setCurrentPage(duplicatedPage);
        markEditorDirty(editor);
    }, [editor, setCurrentPage]);

    const handleDelete = useCallback((page: Page) => {
        if (!editor) return;

        const pages = editor.Pages.getAll();
        if (pages.length <= 1) return;

        const pageName = String(page.get("name") || "this page");
        const confirmed = window.confirm(`Delete "${pageName}"? This removes the page from the project.`);
        if (!confirmed) return;

        const currentIndex = pages.findIndex((candidate) => candidate === page);
        const fallback = pages[currentIndex + 1] || pages[currentIndex - 1] || pages[0];
        editor.Pages.remove(page);

        if (fallback && fallback !== page) {
            editor.Pages.select(fallback);
            setCurrentPage(fallback);
        }

        markEditorDirty(editor);
    }, [editor, setCurrentPage]);

    const handleMove = useCallback((page: Page, direction: -1 | 1) => {
        if (!editor) return;

        const pages = editor.Pages.getAll();
        const currentIndex = pages.findIndex((candidate) => candidate === page);
        const nextIndex = currentIndex + direction;
        if (currentIndex === -1 || nextIndex < 0 || nextIndex >= pages.length) return;

        const moved = editor.Pages.move(page, { at: nextIndex });
        if (moved) {
            editor.Pages.select(moved);
            setCurrentPage(moved);
            markEditorDirty(editor);
            force();
        }
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
                {pages.map((page: Page, index) => {
                    const id = page.get("id") as string;
                    const name = (page.get("name") as string) ?? id;
                    const selected = currentPageId === id;
                    return (
                        <PageRow
                            key={id}
                            editor={editor}
                            page={page}
                            name={name}
                            index={index}
                            totalPages={pages.length}
                            selected={selected}
                            onSelect={() => {
                                editor.Pages.select(page);
                                setCurrentPage(page);
                            }}
                            onDuplicate={() => handleDuplicate(page)}
                            onDelete={() => handleDelete(page)}
                            onMoveUp={() => handleMove(page, -1)}
                            onMoveDown={() => handleMove(page, 1)}
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
    editor: Editor;
    page: Page;
    name: string;
    index: number;
    totalPages: number;
    selected: boolean;
    onSelect: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

function PageRow({
    editor,
    page,
    name,
    index,
    totalPages,
    selected,
    onSelect,
    onDuplicate,
    onDelete,
    onMoveUp,
    onMoveDown,
}: PageRowProps) {
    const [editing, setEditing] = useState(false);
    const [draftName, setDraftName] = useState(name);
    const [draftSlug, setDraftSlug] = useState(readPageSeo(page).slug || slugify(name));
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        setDraftName(name);
        setDraftSlug(readPageSeo(page).slug || slugify(name));
    }, [name, page]);

    const commitName = () => {
        const next = draftName.trim();
        if (next && next !== name) {
            const seo = readPageSeo(page);
            page.set("name", next);
            if (!seo.title) writePageSeo(page, { title: next });
            if (!seo.slug) {
                const nextSlug = slugify(next);
                setDraftSlug(nextSlug);
                writePageSeo(page, { slug: nextSlug });
            }
            markEditorDirty(editor);
        }
        setEditing(false);
    };

    const startEditing = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDraftName(name);
        setEditing(true);
    };

    const commitSlug = () => {
        const nextSlug = slugify(draftSlug || name);
        setDraftSlug(nextSlug);
        writePageSeo(page, { slug: nextSlug });
        markEditorDirty(editor);
    };

    const showActions = hovered || selected;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={[
                "group rounded-md border",
                selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent bg-transparent hover:bg-accent",
            ].join(" ")}
        >
            <div
                role="button"
                tabIndex={0}
                onClick={onSelect}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") onSelect();
                }}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
            >
                <FileText className="size-3.5 shrink-0 text-muted-foreground" />

                {editing ? (
                    <Input
                        value={draftName}
                        autoFocus
                        onChange={(event) => setDraftName(event.target.value)}
                        onBlur={commitName}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") commitName();
                            if (event.key === "Escape") setEditing(false);
                        }}
                        className="h-6 flex-1 border-none bg-transparent p-0 text-xs focus-visible:ring-0"
                    />
                ) : (
                    <span className="flex-1 truncate text-[11px]">{name}</span>
                )}

                {showActions && !editing && (
                    <div className="ml-auto flex shrink-0 items-center gap-0.5">
                        <IconAction label="Move page up" disabled={index === 0} onClick={onMoveUp}>
                            <ChevronUp className="size-2.5" />
                        </IconAction>
                        <IconAction label="Move page down" disabled={index === totalPages - 1} onClick={onMoveDown}>
                            <ChevronDown className="size-2.5" />
                        </IconAction>
                        <IconAction label="Duplicate page" onClick={onDuplicate}>
                            <Copy className="size-2.5" />
                        </IconAction>
                        <IconAction label="Rename page" onClick={startEditing}>
                            <Pencil className="size-2.5" />
                        </IconAction>
                        <IconAction label="Delete page" disabled={totalPages <= 1} onClick={onDelete} danger>
                            <Trash2 className="size-2.5" />
                        </IconAction>
                    </div>
                )}
            </div>

            {selected && (
                <div className="space-y-1 border-t border-border/60 px-2 pb-2 pt-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Link2 className="size-3" />
                        <span>{index === 0 ? "Home publishes as index.html" : "Publish slug"}</span>
                    </div>
                    <Input
                        value={draftSlug}
                        onChange={(event) => setDraftSlug(event.target.value)}
                        onBlur={commitSlug}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.currentTarget.blur();
                            }
                            if (event.key === "Escape") {
                                setDraftSlug(readPageSeo(page).slug || slugify(name));
                                event.currentTarget.blur();
                            }
                        }}
                        placeholder="about-us"
                        className="h-7 text-[11px]"
                    />
                    {index > 0 && (
                        <p className="truncate text-[10px] text-muted-foreground">
                            Publishes as /{slugify(draftSlug || name) || `page-${index + 1}`}.html
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

function IconAction({
    label,
    children,
    onClick,
    disabled,
    danger,
}: {
    label: string;
    children: ReactNode;
    onClick: (event: React.MouseEvent) => void;
    disabled?: boolean;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={(event) => {
                event.stopPropagation();
                onClick(event);
            }}
            className={[
                "flex shrink-0 items-center justify-center rounded p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                danger
                    ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
        >
            {children}
        </button>
    );
}
