/**
 * TraitsPanel
 * -----------
 * Renders GrapesJS traits for the currently selected component.
 * - Listens to component:selected / deselected / update events
 * - Renders the correct input per trait type
 * - Calls trait.setValue() on change (correct GrapesJS API)
 * - Shows a Badge with the component type and a Card per trait
 */

import { useEffect, useReducer } from "react";
import type { Trait } from "grapesjs";

// ── shadcn/ui components ──────────────────────────────────────────────────────
import { Input }                       from "@/components/ui/input";
import { Label }                       from "@/components/ui/label";
import { Badge }                       from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// ── editor context ────────────────────────────────────────────────────────────
import { useGrapesEditor } from "@/editor/context/EditorContext";
import { getPageFilename } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: renders the right input element for a given trait type
// ─────────────────────────────────────────────────────────────────────────────
function TraitInput({ trait }: { trait: Trait }) {
    const type    = (trait.get("type") as string) || "text";
    const value   = trait.getValue() ?? "";
    const options = (trait.get("options") as { id: string; label?: string }[]) || [];

    // ── select ────────────────────────────────────────────────────────────────
    if (type === "select") {
        return (
            <select
                value={String(value)}
                onChange={(e) => trait.setValue(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-[11px] text-foreground shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.label ?? opt.id}
                    </option>
                ))}
            </select>
        );
    }

    // ── checkbox ──────────────────────────────────────────────────────────────
    if (type === "checkbox") {
        return (
            <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => trait.setValue(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
            />
        );
    }

    // ── textarea (for long text content) ─────────────────────────────────────
    if (type === "textarea") {
        return (
            <textarea
                value={String(value)}
                onChange={(e) => trait.setValue(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-[11px] text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
        );
    }

    // ── href → url input with page suggestions ───────────────────────────────
    if (type === "href") {
        const pages = trait.em?.get("PageManager")?.getAll() || [];
        const datalistId = `href-suggestions-${trait.cid}`;
        const selectedId = trait.em?.get("PageManager")?.getSelected()?.get("id");

        return (
            <div className="flex flex-col gap-1">
                <Input
                    type="text"
                    list={datalistId}
                    className="h-7 text-[11px]"
                    value={String(value)}
                    onChange={(e) => trait.setValue(e.target.value)}
                    placeholder="e.g. about.html or #form-section"
                />
                <datalist id={datalistId}>
                    {pages.map((p: any, idx: number) => {
                        const id = p.get("id");
                        const filename = getPageFilename(p, idx);
                        const label = p.get("name") || id;
                        
                        return (
                            <option key={id} value={filename}>
                                {label} {id === selectedId ? "(Current)" : ""}
                            </option>
                        );
                    })}
                </datalist>
            </div>
        );
    }

    // ── number ────────────────────────────────────────────────────────────────
    if (type === "number") {
        return (
            <Input
                type="number"
                className="h-7 text-[11px]"
                value={String(value)}
                onChange={(e) => trait.setValue(Number(e.target.value))}
            />
        );
    }

    // ── default: text ─────────────────────────────────────────────────────────
    return (
        <Input
            type="text"
            className="h-7 text-[11px]"
            value={String(value)}
            onChange={(e) => trait.setValue(e.target.value)}
            placeholder={trait.get("placeholder") as string | undefined}
        />
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main panel
// ─────────────────────────────────────────────────────────────────────────────
export function TraitsPanel() {
    const { editor, isReady } = useGrapesEditor();

    // Cheap force-rerender — avoids storing GrapesJS objects in React state
    const [, forceRender] = useReducer((x: number) => x + 1, 0);

    // Subscribe to selection & component mutation events
    useEffect(() => {
        if (!editor) return;

        const rerender = () => forceRender();

        editor.on("component:selected",   rerender);
        editor.on("component:deselected", rerender);
        editor.on("component:update",     rerender);

        return () => {
            editor.off("component:selected",   rerender);
            editor.off("component:deselected", rerender);
            editor.off("component:update",     rerender);
        };
    }, [editor]);

    // ── Editor not yet initialised ────────────────────────────────────────────
    if (!isReady || !editor) {
        return (
            <p className="p-4 text-[11px] text-muted-foreground">
                Open a project to edit traits.
            </p>
        );
    }

    const selected = editor.getSelected();

    // ── No component selected ─────────────────────────────────────────────────
    if (!selected) {
        return (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
                <Badge variant="secondary" className="text-[10px]">
                    No Component Selected
                </Badge>
                <p className="text-[11px] text-muted-foreground">
                    Click an element on the canvas to edit its properties.
                </p>
            </div>
        );
    }

    const traits         = selected.getTraits() as Trait[];
    // Get the GrapesJS component type name (e.g. "link", "image", "text")
    const componentType  = (selected.get("type") as string | undefined) ?? "component";

    // ── Component selected but no traits ─────────────────────────────────────
    if (!traits.length) {
        return (
            <div className="p-4 space-y-2">
                <Badge variant="outline" className="text-[10px] capitalize">
                    {componentType}
                </Badge>
                <p className="text-[11px] text-muted-foreground">
                    This element has no configurable traits.
                </p>
            </div>
        );
    }

    // ── Render traits ─────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-3 p-3">

            {/* ── Header: panel title + component type badge ── */}
            <Card className="py-3 gap-0">
                <CardHeader className="px-4 pb-0 pt-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                            Properties
                        </CardTitle>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                            {componentType}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* ── One Card per trait ── */}
            {traits.map((trait) => {
                // Capitalise label: "background-color" → "Background-color"
                const rawLabel = (trait.get("label") as string | undefined)
                    || (trait.get("name") as string | undefined)
                    || "Trait";
                const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
                const type  = (trait.get("type") as string) || "text";

                return (
                    <Card key={trait.cid} className="py-3 gap-0">
                        <CardContent className="px-4 space-y-1.5">
                            {/* Trait label */}
                            <Label className="text-[11px] text-muted-foreground font-medium">
                                {label}
                            </Label>

                            {/* Type-appropriate input */}
                            {type === "checkbox" ? (
                                // Checkbox: label + input side by side
                                <div className="flex items-center gap-2 pt-0.5">
                                    <TraitInput trait={trait} />
                                    <span className="text-[11px] text-muted-foreground">
                                        {label}
                                    </span>
                                </div>
                            ) : (
                                <TraitInput trait={trait} />
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
