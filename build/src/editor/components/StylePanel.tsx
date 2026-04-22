/**
 * StylePanel
 * ----------
 * Groups common CSS properties into sections:
 *  - Typography
 *  - Background
 *  - Spacing
 *  - Layout
 *  - Border
 *  - Effects
 *
 * All updates are applied via selected.addStyle().
 */

import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useGrapesEditor } from "@/editor/context/EditorContext";

type StyleMap = Record<string, string>;

function read(style: StyleMap, kebab: string, camel: string): string {
    return style[kebab] ?? (style as any)[camel] ?? "";
}

export function StylePanel() {
    const { editor, isReady } = useGrapesEditor();
    const [styles, setStyles] = useState<StyleMap>({});

    const syncFromSelection = useCallback(() => {
        if (!editor) return;
        const sel = editor.getSelected();
        if (!sel) {
            setStyles({});
            return;
        }
        setStyles(sel.getStyle() as StyleMap);
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        const onSel = () => syncFromSelection();
        const onUpd = () => syncFromSelection();
        editor.on("component:selected", onSel);
        editor.on("component:deselected", onSel);
        editor.on("component:styleUpdate", onUpd);
        const t = window.setTimeout(syncFromSelection, 0);
        return () => {
            window.clearTimeout(t);
            editor.off("component:selected", onSel);
            editor.off("component:deselected", onSel);
            editor.off("component:styleUpdate", onUpd);
        };
    }, [editor, syncFromSelection]);

    const apply = useCallback(
        (patch: StyleMap) => {
            if (!editor) return;
            const sel = editor.getSelected();
            if (!sel) return;
            sel.addStyle(patch);
            setStyles((prev) => ({ ...prev, ...patch }));
        },
        [editor],
    );

    const hasSelection = !!editor?.getSelected();

    if (!isReady) {
        return (
            <div className="p-3 text-xs text-muted-foreground">
                Editor not ready. Open a project to edit styles.
            </div>
        );
    }

    return (
        <div className="space-y-4 p-3 text-xs">
            {!hasSelection && (
                <p className="text-muted-foreground">
                    Select an element on the canvas to edit its styles.
                </p>
            )}

            {/* Layout */}
            <Section title="Layout">
                <div className="grid grid-cols-2 gap-2">
                    <Field
                        label="Display"
                        placeholder="block | flex | grid"
                        value={read(styles, "display", "display")}
                        onChange={(v) => apply({ display: v })}
                    />
                    <Field
                        label="Position"
                        placeholder="static | relative"
                        value={read(styles, "position", "position")}
                        onChange={(v) => apply({ position: v })}
                    />
                    <Field
                        label="Width"
                        placeholder="auto | 100%"
                        value={read(styles, "width", "width")}
                        onChange={(v) => apply({ width: v })}
                    />
                    <Field
                        label="Height"
                        placeholder="auto"
                        value={read(styles, "height", "height")}
                        onChange={(v) => apply({ height: v })}
                    />
                    <Field
                        label="Justify"
                        placeholder="flex-start"
                        value={read(styles, "justify-content", "justifyContent")}
                        onChange={(v) => apply({ "justify-content": v })}
                    />
                    <Field
                        label="Align"
                        placeholder="stretch"
                        value={read(styles, "align-items", "alignItems")}
                        onChange={(v) => apply({ "align-items": v })}
                    />
                </div>
            </Section>

            {/* Typography */}
            <Section title="Typography">
                <div className="grid grid-cols-2 gap-2">
                    <Field
                        label="Font size"
                        placeholder="16px"
                        value={read(styles, "font-size", "fontSize")}
                        onChange={(v) => apply({ "font-size": normalizePx(v) })}
                    />
                    <Field
                        label="Font weight"
                        placeholder="400"
                        value={read(styles, "font-weight", "fontWeight")}
                        onChange={(v) => apply({ "font-weight": v })}
                    />
                    <Field
                        label="Line height"
                        placeholder="1.5"
                        value={read(styles, "line-height", "lineHeight")}
                        onChange={(v) => apply({ "line-height": v })}
                    />
                    <Field
                        label="Letter spacing"
                        placeholder="0px"
                        value={read(styles, "letter-spacing", "letterSpacing")}
                        onChange={(v) => apply({ "letter-spacing": v })}
                    />
                    <Field
                        label="Text align"
                        placeholder="left | center"
                        value={read(styles, "text-align", "textAlign")}
                        onChange={(v) => apply({ "text-align": v })}
                    />
                    <Field
                        label="Text color"
                        placeholder="#0f172a"
                        value={read(styles, "color", "color")}
                        onChange={(v) => apply({ color: v })}
                    />
                </div>
            </Section>

            {/* Background */}
            <Section title="Background">
                <div className="grid grid-cols-[auto,1fr] items-center gap-2">
                    <Label className="text-[11px] text-muted-foreground">Color</Label>
                    <Input
                        type="color"
                        className="h-6 w-12 cursor-pointer p-0"
                        value={toInputColor(read(styles, "background-color", "backgroundColor"))}
                        onChange={(e) =>
                            apply({ "background-color": e.target.value as string })
                        }
                    />
                    <div />
                    <Input
                        className="h-7"
                        placeholder="#ffffff"
                        value={read(styles, "background-color", "backgroundColor")}
                        onChange={(e) =>
                            apply({ "background-color": e.target.value as string })
                        }
                    />
                    <Field
                        label="Image / gradient"
                        placeholder="url(...) or gradient(...)"
                        value={read(styles, "background-image", "backgroundImage")}
                        onChange={(v) => apply({ "background-image": v })}
                        full
                    />
                </div>
            </Section>

            {/* Spacing */}
            <Section title="Spacing">
                <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground">Margin</Label>
                    <BoxFour
                        prefix="margin"
                        values={styles}
                        onChange={(side, v) => apply({ [`margin-${side}`]: v })}
                    />
                    <Label className="mt-2 text-[11px] text-muted-foreground">
                        Padding
                    </Label>
                    <BoxFour
                        prefix="padding"
                        values={styles}
                        onChange={(side, v) => apply({ [`padding-${side}`]: v })}
                    />
                </div>
            </Section>


            {/* Border */}
            <Section title="Border">
                <div className="grid grid-cols-2 gap-2">
                    <Field
                        label="Width"
                        placeholder="1px"
                        value={read(styles, "border-width", "borderWidth")}
                        onChange={(v) => apply({ "border-width": v })}
                    />
                    <Field
                        label="Radius"
                        placeholder="0px"
                        value={read(styles, "border-radius", "borderRadius")}
                        onChange={(v) => apply({ "border-radius": v })}
                    />
                    <Field
                        label="Color"
                        placeholder="#e2e8f0"
                        value={read(styles, "border-color", "borderColor")}
                        onChange={(v) => apply({ "border-color": v })}
                        full
                    />
                </div>
            </Section>

            {/* Effects */}
            <Section title="Effects">
                <div className="grid grid-cols-2 gap-2">
                    <Field
                        label="Opacity"
                        placeholder="1"
                        value={read(styles, "opacity", "opacity")}
                        onChange={(v) => apply({ opacity: v })}
                    />
                    <Field
                        label="Shadow"
                        placeholder="0 4px 12px rgba(0,0,0,0.1)"
                        value={read(styles, "box-shadow", "boxShadow")}
                        onChange={(v) => apply({ "box-shadow": v })}
                        full
                    />
                </div>
            </Section>
        </div>
    );
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
    return (
        <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {title}
                </span>
            </div>
            <Separator />
            {children}
        </section>
    );
}

interface FieldProps {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    full?: boolean;
}

function Field({ label, value, placeholder, onChange, full }: FieldProps) {
    return (
        <div className={full ? "col-span-2 space-y-1" : "space-y-1"}>
            <Label className="text-[11px] text-muted-foreground">{label}</Label>
            <Input
                className="h-7"
                value={value ?? ""}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

interface BoxFourProps {
    prefix: "margin" | "padding";
    values: StyleMap;
    onChange: (side: "top" | "right" | "bottom" | "left", value: string) => void;
}

function BoxFour({ prefix, values, onChange }: BoxFourProps) {
    const map: Array<["top" | "right" | "bottom" | "left", string]> = [
        ["top", "T"],
        ["right", "R"],
        ["bottom", "B"],
        ["left", "L"],
    ];
    return (
        <div className="grid grid-cols-4 gap-1">
            {map.map(([side, label]) => {
                const key = `${prefix}-${side}`;
                return (
                    <div key={key} className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                            {label}
                        </Label>
                        <Input
                            className="h-7 px-1 text-[11px]"
                            value={(values[key] as string) ?? ""}
                            placeholder="0"
                            onChange={(e) => onChange(side, e.target.value)}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function normalizePx(value: string): string {
    const t = value.trim();
    if (!t) return "";
    if (/^\d+(\.\d+)?$/.test(t)) return `${t}px`;
    return t;
}

function toInputColor(css: string): string {
    if (!css || css === "transparent" || css === "inherit") return "#ffffff";
    if (/^#[0-9a-fA-F]{6}$/.test(css.trim())) return css;
    if (/^#[0-9a-fA-F]{3}$/.test(css.trim())) {
        const x = css.slice(1);
        return `#${x[0]}${x[0]}${x[1]}${x[1]}${x[2]}${x[2]}`;
    }
    return "#ffffff";
}

