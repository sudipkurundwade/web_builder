import React, { useCallback, useEffect, useState, useReducer } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Settings, SlidersHorizontal, Lock, Type, Image as LucideImage, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useGrapesEditor } from "@/editor/context/EditorContext";
import { TraitsPanel } from "@/editor/components/TraitsPanel";
import { StylePanel } from "@/editor/components/StylePanel";

type StyleMap = Record<string, string>;

function read(style: StyleMap, kebab: string, camel: string): string {
    return style[kebab] ?? (style as any)[camel] ?? "";
}

function normalizePx(value: string): string {
    const t = value.trim();
    if (!t) return "";
    if (/^\d+(\.\d+)?$/.test(t)) return `${t}px`;
    return t;
}

export function FormattingToolbar() {
    const { editor, isReady } = useGrapesEditor();
    const [styles, setStyles] = useState<StyleMap>({});
    const [, forceRender] = useReducer((x: number) => x + 1, 0);

    const syncFromSelection = useCallback(() => {
        if (!editor) return;
        const sel = editor.getSelected();
        if (!sel) {
            setStyles({});
            return;
        }
        setStyles(sel.getStyle() as StyleMap);
        forceRender();
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

    if (!isReady || !editor) return null;

    const selected = editor.getSelected();
    
    // Determine if we should show the toolbar
    if (!selected) {
        return (
            <div className="flex h-12 w-full shrink-0 flex-row items-center border-b bg-background px-4 text-xs text-muted-foreground">
                <span className="opacity-60">Select an element to edit styles</span>
            </div>
        );
    }

    const componentType = selected.get("type") as string || "component";

    // Computed properties
    const fontFamily = read(styles, "font-family", "fontFamily")?.split(',')[0].replace(/['"]/g, '') || "Inter";
    const fontSize = read(styles, "font-size", "fontSize").replace('px', '');
    const fontWeight = read(styles, "font-weight", "fontWeight");
    const fontStyle = read(styles, "font-style", "fontStyle");
    const textDecoration = read(styles, "text-decoration", "textDecoration");
    const textAlign = read(styles, "text-align", "textAlign");
    const color = read(styles, "color", "color");
    const bgColor = read(styles, "background-color", "backgroundColor");
    const width = read(styles, "width", "width");
    const height = read(styles, "height", "height");

    const getComponentIcon = () => {
        switch(componentType) {
            case 'text':
            case 'textnode': return <Type className="size-3.5" />;
            case 'image': return <LucideImage className="size-3.5" />;
            default: return <Square className="size-3.5" />;
        }
    }

    return (
        <div className="flex h-12 w-full shrink-0 flex-row items-center gap-2 overflow-x-auto border-b bg-background px-3 shadow-sm custom-scrollbar">
            
            {/* Component Identifier */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border shrink-0">
                {getComponentIcon()}
                <span className="text-[11px] font-medium capitalize max-w-[80px] truncate">
                    {componentType}
                </span>
            </div>

            <div className="h-5 w-px bg-border shrink-0 mx-1" />

            {/* Background Color */}
            <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative size-6 shrink-0 rounded-full border shadow-sm overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" 
                     title="Background Color">
                    <input
                        type="color"
                        className="absolute -inset-2 h-10 w-10 cursor-pointer opacity-0"
                        value={bgColor && bgColor.startsWith('#') ? bgColor : "#ffffff"}
                        onChange={(e) => apply({ "background-color": e.target.value })}
                    />
                    {getCheckerboardBg(bgColor)}
                </div>
            </div>

            <div className="h-5 w-px bg-border shrink-0 mx-1" />

            {/* Typography Group */}
            <div className="flex items-center gap-1 shrink-0">
                {/* Font Selector */}
                <Select value={fontFamily} onValueChange={(v) => apply({ "font-family": v })}>
                    <SelectTrigger className="h-7 w-[120px] text-[11px] border-none shadow-none bg-transparent hover:bg-muted focus:ring-0">
                        <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                        <SelectItem value="system-ui">System Default</SelectItem>
                    </SelectContent>
                </Select>

                <div className="h-4 w-px bg-border mx-1" />

                {/* Font Size Setup */}
                <div className="flex items-center border rounded-md h-7 overflow-hidden bg-background shrink-0">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-full w-6 rounded-none active:bg-muted focus-visible:ring-0 text-[11px]"
                        onClick={() => {
                            const val = parseFloat(fontSize || "16");
                            if (!isNaN(val)) apply({ "font-size": `${val - 1}px` });
                        }}
                    >
                        -
                    </Button>
                    <Input 
                        value={fontSize || ""} 
                        placeholder="16"
                        className="h-full w-12 border-none rounded-none text-center px-1 text-[11px] h-7 focus-visible:ring-0 shadow-none focus-visible:ring-offset-0"
                        onChange={(e) => apply({ "font-size": normalizePx(e.target.value) })}
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-full w-6 rounded-none active:bg-muted focus-visible:ring-0 text-[11px]"
                        onClick={() => {
                            const val = parseFloat(fontSize || "16");
                            if (!isNaN(val)) apply({ "font-size": `${val + 1}px` });
                        }}
                    >
                        +
                    </Button>
                </div>

                {/* Text Color */}
                <div className="relative size-6 shrink-0 rounded border shadow-sm mx-1.5 overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                     title="Text Color">
                    <input
                        type="color"
                        className="absolute -inset-2 h-10 w-10 cursor-pointer opacity-0"
                        value={color && color.startsWith('#') ? color : "#000000"}
                        onChange={(e) => apply({ "color": e.target.value })}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: color && color.startsWith('#') ? color : '#000000' }} />
                    <span className="text-[12px] font-bold leading-none -mt-0.5">A</span>
                </div>

                <div className="h-4 w-px bg-border mx-1" />

                {/* Text Styles Toggles */}
                <Toggle 
                    size="sm" 
                    className="h-7 w-7 p-0 data-[state=on]:bg-muted" 
                    pressed={fontWeight === "bold" || fontWeight === "700" || fontWeight === "800" || fontWeight === "900"} 
                    onPressedChange={(p) => apply({ "font-weight": p ? "bold" : "normal" })}
                    title="Bold"
                >
                    <Bold className="size-3.5" />
                </Toggle>
                
                <Toggle 
                    size="sm" 
                    className="h-7 w-7 p-0 data-[state=on]:bg-muted" 
                    pressed={fontStyle === "italic"} 
                    onPressedChange={(p) => apply({ "font-style": p ? "italic" : "normal" })}
                    title="Italic"
                >
                    <Italic className="size-3.5" />
                </Toggle>
                
                <Toggle 
                    size="sm" 
                    className="h-7 w-7 p-0 data-[state=on]:bg-muted" 
                    pressed={textDecoration === "underline"} 
                    onPressedChange={(p) => apply({ "text-decoration": p ? "underline" : "none" })}
                    title="Underline"
                >
                    <Underline className="size-3.5" />
                </Toggle>

                <div className="h-4 w-px bg-border mx-1" />

                {/* Alignment Toggle Group */}
                <ToggleGroup type="single" value={textAlign || "left"} onValueChange={(v) => { if (v) apply({ "text-align": v }) }} className="shrink-0 gap-0">
                    <ToggleGroupItem value="left" className="h-7 w-7 p-0 focus:ring-0">
                        <AlignLeft className="size-3.5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" className="h-7 w-7 p-0 focus:ring-0">
                        <AlignCenter className="size-3.5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" className="h-7 w-7 p-0 focus:ring-0">
                        <AlignRight className="size-3.5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="justify" className="h-7 w-7 p-0 focus:ring-0">
                        <AlignJustify className="size-3.5" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="h-5 w-px bg-border shrink-0 mx-1" />

            {/* Sizing (Width/Height) */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground ml-1">W</span>
                    <Input 
                        value={width || ""} 
                        placeholder="auto"
                        className="h-7 w-[60px] text-[11px] px-2 shadow-sm"
                        onChange={(e) => apply({ "width": normalizePx(e.target.value) })}
                    />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">H</span>
                    <Input 
                        value={height || ""} 
                        placeholder="auto"
                        className="h-7 w-[60px] text-[11px] px-2 shadow-sm"
                        onChange={(e) => apply({ "height": normalizePx(e.target.value) })}
                    />
                </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* Advanced Style Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px] px-2.5">
                            <SlidersHorizontal className="size-3" />
                            Advanced
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[320px] p-0 shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="px-4 py-3 border-b bg-muted/30">
                            <h4 className="font-semibold text-xs capitalize">Advanced Formatting: {componentType}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Control layout, spacing, and borders.</p>
                        </div>
                        <div className="overflow-y-auto flex-1 min-h-0 bg-popover">
                            <StylePanel />
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Traits/Settings Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px] px-2.5">
                            <Settings className="size-3" />
                            Properties
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[320px] p-0 shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="px-4 py-3 border-b bg-muted/30">
                            <h4 className="font-semibold text-xs capitalize">Element Properties: {componentType}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Settings specific to this component type.</p>
                        </div>
                        <div className="overflow-y-auto flex-1 min-h-0 bg-popover pb-2">
                            <TraitsPanel />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            
        </div>
    );
}

function getCheckerboardBg(color?: string) {
    if (!color || color === 'transparent') {
        return (
            <div className="absolute inset-0 bg-white" style={{
                backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(135deg, transparent 75%, #ccc 75%)`,
                backgroundSize: `8px 8px`,
                backgroundPosition: `0 0, 4px 0, 4px -4px, 0px 4px`
            }}>
                <div className="absolute inset-0 flex items-center justify-center mask border-red-500 border-b-2 rotate-45 transform origin-center translate-y-2 opacity-50" />
            </div>
        )
    }
    return <div className="absolute inset-0" style={{ backgroundColor: color }} />
}
