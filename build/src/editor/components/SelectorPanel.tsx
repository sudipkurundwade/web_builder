/**
 * SelectorPanel
 * -------------
 * Manages CSS classes on the selected component using SelectorManager.
 */

import { useEffect, useReducer, useState } from "react";
import type { Selector } from "grapesjs";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGrapesEditor } from "@/editor/context/EditorContext";

export function SelectorPanel() {
    const { editor, isReady } = useGrapesEditor();
    const [, force] = useReducer((x: number) => x + 1, 0);
    const [newClass, setNewClass] = useState("");

    useEffect(() => {
        if (!editor) return;
        const rerender = () => force();
        editor.on("component:selected", rerender);
        editor.on("component:deselected", rerender);
        editor.on("component:update", rerender);
        return () => {
            editor.off("component:selected", rerender);
            editor.off("component:deselected", rerender);
            editor.off("component:update", rerender);
        };
    }, [editor]);

    if (!isReady || !editor) {
        return (
            <p className="p-3 text-xs text-muted-foreground">
                Editor not ready. Open a project to manage classes.
            </p>
        );
    }

    const selected = editor.getSelected();
    if (!selected) {
        return (
            <p className="p-3 text-xs text-muted-foreground">
                Select an element to manage its classes.
            </p>
        );
    }

    const selectors = selected.getSelectors() as unknown as Selector[];

    const addClass = () => {
        const name = newClass.trim();
        if (!name) return;
        const manager = editor.SelectorManager;
        const selector = manager.add(name);
        selected.addClass(selector as unknown as string);
        setNewClass("");
        force();
    };

    const removeClass = (selector: Selector) => {
        selected.removeClass(selector as unknown as string);
        force();
    };

    return (
        <div className="space-y-3 p-3 text-xs">
            <div className="flex items-center gap-2">
                <Input
                    className="h-7 flex-1"
                    placeholder="Add class (e.g. hero-title)"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addClass();
                        }
                    }}
                />
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={addClass}
                >
                    <Plus className="size-3" />
                </Button>
            </div>

            <div className="space-y-1">
                {selectors.length === 0 && (
                    <p className="text-[11px] text-muted-foreground">
                        No classes applied yet.
                    </p>
                )}
                {selectors.map((sel) => {
                    const name = sel.get("name") as string;
                    return (
                        <div
                            key={sel.cid}
                            className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-1.5"
                        >
                            <span className="truncate text-[11px] font-medium">
                                .{name}
                            </span>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeClass(sel)}
                            >
                                <X className="size-3" />
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

