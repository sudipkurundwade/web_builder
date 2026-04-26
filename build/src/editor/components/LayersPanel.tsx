import { useEffect, useMemo, useReducer, useState } from "react";
import type { Component } from "grapesjs";
import { Box, FolderIcon, FolderOpenIcon } from "lucide-react";
import {
    Files,
    FilesHighlight,
    File,
    FileHighlight,
    FileIcon,
    FileLabel,
    Folder,
    FolderHeader,
    FolderHighlight,
    FolderIcon as AnimatedFolderIcon,
    FolderItem,
    FolderPanel,
    FolderTrigger,
} from "@/components/animate-ui/primitives/base/files";
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
    selectedId: string;
    onSelect: (c: Component) => void;
}

function getLayerNodeId(component: Component): string {
    return component.getId?.() ?? String(component.cid);
}

function collectFolderIds(components: Component[]): string[] {
    const ids: string[] = [];
    for (const component of components) {
        const children = component.components()?.models ?? [];
        if (children.length > 0) {
            ids.push(getLayerNodeId(component));
            ids.push(...collectFolderIds(children));
        }
    }
    return ids;
}

function LayerRow({ component, selectedId, onSelect }: LayerRowProps) {
    const id = getLayerNodeId(component);
    const children = component.components()?.models ?? [];
    const hasChildren = children.length > 0;
    const isSelected = id === selectedId;

    return (
        hasChildren ? (
            <FolderItem value={id}>
                <FolderHeader>
                    <FolderTrigger
                        className="w-full text-start"
                        onClick={() => onSelect(component)}
                    >
                        <FolderHighlight>
                            <Folder
                                className={cn(
                                    "flex items-center justify-between gap-2 rounded-md p-2 text-xs transition-colors hover:bg-accent",
                                    isSelected && "bg-primary/10 text-primary",
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <AnimatedFolderIcon
                                        closeIcon={<FolderIcon className="size-4" />}
                                        openIcon={<FolderOpenIcon className="size-4" />}
                                    />
                                    <FileLabel className="truncate font-medium">
                                        {layerLabel(component)}
                                    </FileLabel>
                                </div>
                                <span className="truncate text-[10px] text-muted-foreground">
                                    {id.slice(0, 8)}…
                                </span>
                            </Folder>
                        </FolderHighlight>
                    </FolderTrigger>
                </FolderHeader>
                <FolderPanel className="pl-4">
                    {children.map((child) => (
                        <LayerRow
                            key={getLayerNodeId(child)}
                            component={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    ))}
                </FolderPanel>
            </FolderItem>
        ) : (
            <FileHighlight>
                <File
                    className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-md p-2 text-xs transition-colors hover:bg-accent",
                        isSelected && "bg-primary/10 text-primary",
                    )}
                    onClick={() => onSelect(component)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(component);
                        }
                    }}
                >
                    <div className="flex items-center gap-2">
                        <FileIcon>
                            <Box className="size-4 text-muted-foreground" />
                        </FileIcon>
                        <FileLabel className="truncate font-medium">
                            {layerLabel(component)}
                        </FileLabel>
                    </div>
                    <span className="truncate text-[10px] text-muted-foreground">
                        {id.slice(0, 8)}…
                    </span>
                </File>
            </FileHighlight>
        )
    );
}

export function LayersPanel() {
    const { editor, isReady } = useGrapesEditor();
    const [, refresh] = useReducer((x: number) => x + 1, 0);
    const [openIds, setOpenIds] = useState<string[]>([]);

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
    const selectedId = selected ? getLayerNodeId(selected) : "";
    const folderIds = useMemo(() => collectFolderIds(roots), [roots]);

    useEffect(() => {
        if (folderIds.length === 0) {
            setOpenIds([]);
            return;
        }
        setOpenIds((prev) => {
            const validPrev = prev.filter((id) => folderIds.includes(id));
            if (validPrev.length > 0) return validPrev;
            return folderIds.slice(0, roots.length);
        });
    }, [folderIds, roots.length]);

    return (
        <Files
            className="text-foreground"
            open={openIds}
            onOpenChange={(value) => setOpenIds(value)}
        >
            <FilesHighlight className="rounded-lg bg-accent/60">
            {roots.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted-foreground">
                    No components on canvas yet.
                </p>
            ) : (
                roots.map((c) => (
                    <LayerRow
                        key={getLayerNodeId(c)}
                        component={c}
                        selectedId={selectedId}
                        onSelect={(cmp) => editor.select(cmp)}
                    />
                ))
            )}
            </FilesHighlight>
        </Files>
    );
}
