import { useEffect, useMemo, useState } from "react";
import { Loader2, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useGrapesEditor } from "@/editor/context/EditorContext";
import { fetchPageBlocks, type PageBlock } from "@/services/blocksService";
import {
    buildTemplateRemix,
    defaultRemixSections,
    remixBusinessTypes,
    remixPalettes,
    remixSections,
    remixTones,
} from "@/editor/lib/templateRemix";

interface TemplateRemixPanelProps {
    onPersist?: () => Promise<void>;
}

export function TemplateRemixPanel({ onPersist }: TemplateRemixPanelProps) {
    const { editor, isReady } = useGrapesEditor();
    const [blocks, setBlocks] = useState<PageBlock[]>([]);
    const [businessType, setBusinessType] = useState("saas");
    const [tone, setTone] = useState("modern");
    const [palette, setPalette] = useState("indigo");
    const [sections, setSections] = useState(defaultRemixSections);
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSummary, setLastSummary] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError(null);

        fetchPageBlocks()
            .then((nextBlocks) => {
                if (!cancelled) setBlocks(nextBlocks);
            })
            .catch((err: any) => {
                if (!cancelled) {
                    setError(err?.response?.data?.message || "Failed to load page blocks.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const remix = useMemo(() => {
        return buildTemplateRemix(blocks, { businessType, tone, palette, sections });
    }, [blocks, businessType, tone, palette, sections]);

    const toggleSection = (section: string) => {
        setSections((current) => {
            if (current.includes(section)) {
                return current.filter((item) => item !== section);
            }
            return [...current, section];
        });
    };

    const applyRemix = async (mode: "replace" | "append") => {
        if (!editor || !remix.selectedBlocks.length) return;

        setIsApplying(true);
        setIsSaving(false);
        setError(null);
        try {
            if (mode === "replace") {
                editor.setComponents(remix.html);
                editor.setStyle(remix.css);
            } else {
                editor.addComponents(remix.html);
                const currentCss = editor.getCss() || "";
                editor.setStyle(`${currentCss}\n\n${remix.css}`);
            }
            setIsApplying(false);

            if (onPersist) {
                setIsSaving(true);
                await onPersist();
            }

            setLastSummary(`${mode === "replace" ? "Replaced" : "Appended"} ${remix.selectedBlocks.length} sections and saved.`);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Template Remix was applied, but auto-save failed. Please click Save.");
        } finally {
            setIsApplying(false);
            setIsSaving(false);
        }
    };

    const disabled = !isReady || !editor || isLoading || isApplying || isSaving || sections.length === 0 || remix.selectedBlocks.length === 0;

    return (
        <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 p-3 text-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Sparkles className="size-4 text-primary" />
                        Template Remix
                    </div>
                    <p className="text-muted-foreground">
                        Generate a full page from your saved page blocks without AI.
                    </p>
                </div>

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                        {error}
                    </div>
                )}

                <div className="grid gap-2">
                    <Label className="text-xs">Business</Label>
                    <Select value={businessType} onValueChange={setBusinessType} disabled={isLoading || isApplying || isSaving}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {remixBusinessTypes.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label className="text-xs">Tone</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {remixTones.map((item) => (
                            <Button
                                key={item.value}
                                type="button"
                                variant={tone === item.value ? "default" : "outline"}
                                size="sm"
                                className="h-7 text-[11px]"
                                onClick={() => setTone(item.value)}
                                disabled={isLoading || isApplying || isSaving}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label className="text-xs">Palette</Label>
                    <div className="grid grid-cols-1 gap-1.5">
                        {remixPalettes.map((item) => (
                            <Button
                                key={item.value}
                                type="button"
                                variant={palette === item.value ? "default" : "outline"}
                                size="sm"
                                className="h-7 justify-start gap-2 text-[11px]"
                                onClick={() => setPalette(item.value)}
                                disabled={isLoading || isApplying || isSaving}
                            >
                                <span className={cn("size-3 rounded-full", item.color)} />
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label className="text-xs">Sections</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {remixSections.map((section) => (
                            <Button
                                key={section.value}
                                type="button"
                                variant={sections.includes(section.value) ? "default" : "outline"}
                                size="sm"
                                className="h-7 text-[11px]"
                                onClick={() => toggleSection(section.value)}
                                disabled={isLoading || isApplying || isSaving}
                            >
                                {section.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="rounded-md border bg-muted/20 p-3">
                    <div className="flex items-center gap-2 font-medium">
                        <Palette className="size-3.5" />
                        {remix.selectedBlocks.length} matched sections
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {remix.selectedBlocks.length
                            ? remix.selectedBlocks.map((block) => block.section).join(", ")
                            : "Select sections that exist in your page block seed data."}
                    </p>
                </div>

                <div className="grid gap-2">
                    <Button type="button" onClick={() => void applyRemix("replace")} disabled={disabled}>
                        {isApplying || isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        {isSaving ? "Saving..." : "Replace Canvas"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => void applyRemix("append")} disabled={disabled}>
                        {isSaving ? "Saving..." : "Append To Page"}
                    </Button>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" />
                        Loading page blocks...
                    </div>
                )}

                {lastSummary && (
                    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-700">
                        {lastSummary}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
