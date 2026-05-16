import { useMemo, useState } from "react";
import { Loader2, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";
import { createProject, createRemixProject } from "@/services/projectService";

type NewProjectRemixDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (project: Project) => void;
};

const businessTypes = [
    { value: "saas", label: "SaaS", name: "LaunchKit" },
    { value: "portfolio", label: "Portfolio", name: "Studio North" },
    { value: "restaurant", label: "Restaurant", name: "Bistro Studio" },
    { value: "agency", label: "Agency", name: "Northstar Agency" },
    { value: "fitness", label: "Fitness", name: "Pulse Fit" },
    { value: "ecommerce", label: "Ecommerce", name: "Market Lane" },
    { value: "course", label: "Course", name: "SkillSpring" },
];

const tones = [
    { value: "modern", label: "Modern" },
    { value: "minimal", label: "Minimal" },
    { value: "bold", label: "Bold" },
    { value: "luxury", label: "Luxury" },
];

const palettes = [
    { value: "indigo", label: "Indigo", color: "bg-indigo-600" },
    { value: "emerald", label: "Emerald", color: "bg-emerald-600" },
    { value: "rose", label: "Rose", color: "bg-rose-600" },
    { value: "amber", label: "Amber", color: "bg-amber-500" },
    { value: "zinc", label: "Zinc", color: "bg-zinc-900" },
];

const sectionOptions = [
    { value: "navbar", label: "Navbar" },
    { value: "hero", label: "Hero" },
    { value: "features", label: "Features" },
    { value: "pricing", label: "Pricing" },
    { value: "testimonials", label: "Testimonials" },
    { value: "cta", label: "CTA" },
    { value: "faq", label: "FAQ" },
    { value: "footer", label: "Footer" },
];

const defaultSections = ["navbar", "hero", "features", "pricing", "cta", "footer"];

export function NewProjectRemixDialog({
    open,
    onOpenChange,
    onCreated,
}: NewProjectRemixDialogProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState("");
    const [businessType, setBusinessType] = useState("saas");
    const [tone, setTone] = useState("modern");
    const [palette, setPalette] = useState("indigo");
    const [sections, setSections] = useState(defaultSections);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const suggestedName = useMemo(() => {
        return businessTypes.find((type) => type.value === businessType)?.name || "New Website";
    }, [businessType]);

    const projectName = name.trim() || suggestedName;

    const reset = () => {
        setStep(1);
        setName("");
        setBusinessType("saas");
        setTone("modern");
        setPalette("indigo");
        setSections(defaultSections);
        setError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (isCreating) return;
        onOpenChange(nextOpen);
        if (!nextOpen) reset();
    };

    const toggleSection = (section: string) => {
        setSections((current) => {
            if (current.includes(section)) {
                return current.filter((item) => item !== section);
            }
            return [...current, section];
        });
    };

    const createAndOpen = async (mode: "remix" | "blank") => {
        setIsCreating(true);
        setError(null);

        try {
            const project = mode === "blank"
                ? await createProject(projectName)
                : await createRemixProject({
                    name: projectName,
                    businessType,
                    tone,
                    palette,
                    sections,
                });

            onCreated(project);
            onOpenChange(false);
            reset();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create project. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" />
                        Create Project
                    </DialogTitle>
                    <DialogDescription>
                        Start blank or generate a complete first page from your block library.
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="grid gap-5 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="project-name">Project name</Label>
                            <Input
                                id="project-name"
                                autoFocus
                                placeholder={suggestedName}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                disabled={isCreating}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Business type</Label>
                            <Select value={businessType} onValueChange={setBusinessType} disabled={isCreating}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {businessTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-lg border bg-muted/20 p-4">
                            <p className="text-sm font-medium">{projectName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                The remix flow will create a full home page with themed root CSS variables.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-5 py-2">
                        <div className="grid gap-2">
                            <Label>Tone</Label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {tones.map((item) => (
                                    <Button
                                        key={item.value}
                                        type="button"
                                        variant={tone === item.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTone(item.value)}
                                        disabled={isCreating}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Palette</Label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                {palettes.map((item) => (
                                    <Button
                                        key={item.value}
                                        type="button"
                                        variant={palette === item.value ? "default" : "outline"}
                                        size="sm"
                                        className="justify-start gap-2"
                                        onClick={() => setPalette(item.value)}
                                        disabled={isCreating}
                                    >
                                        <span className={cn("size-3 rounded-full", item.color)} />
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Sections</Label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {sectionOptions.map((section) => (
                                    <Button
                                        key={section.value}
                                        type="button"
                                        variant={sections.includes(section.value) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleSection(section.value)}
                                        disabled={isCreating}
                                    >
                                        {section.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Palette className="size-4" />
                                {projectName}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {businessTypes.find((type) => type.value === businessType)?.label} / {tones.find((item) => item.value === tone)?.label} / {palettes.find((item) => item.value === palette)?.label} / {sections.length} sections
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <DialogFooter className="items-center sm:justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => createAndOpen("blank")}
                        disabled={isCreating}
                    >
                        Blank project
                    </Button>
                    <div className="flex gap-2">
                        {step === 2 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                                disabled={isCreating}
                            >
                                Back
                            </Button>
                        )}
                        {step === 1 ? (
                            <Button type="button" onClick={() => setStep(2)} disabled={isCreating}>
                                Continue
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => createAndOpen("remix")}
                                disabled={isCreating || sections.length === 0}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Generate Project"
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
