import type { PageBlock } from "@/services/blocksService";

export const remixBusinessTypes = [
    { value: "saas", label: "SaaS", name: "LaunchKit" },
    { value: "portfolio", label: "Portfolio", name: "Studio North" },
    { value: "restaurant", label: "Restaurant", name: "Bistro Studio" },
    { value: "agency", label: "Agency", name: "Northstar Agency" },
    { value: "fitness", label: "Fitness", name: "Pulse Fit" },
    { value: "ecommerce", label: "Ecommerce", name: "Market Lane" },
    { value: "course", label: "Course", name: "SkillSpring" },
];

export const remixTones = [
    { value: "modern", label: "Modern" },
    { value: "minimal", label: "Minimal" },
    { value: "bold", label: "Bold" },
    { value: "luxury", label: "Luxury" },
];

export const remixPalettes = [
    { value: "indigo", label: "Indigo", color: "bg-indigo-600" },
    { value: "emerald", label: "Emerald", color: "bg-emerald-600" },
    { value: "rose", label: "Rose", color: "bg-rose-600" },
    { value: "amber", label: "Amber", color: "bg-amber-500" },
    { value: "zinc", label: "Zinc", color: "bg-zinc-900" },
];

export const remixSections = [
    { value: "navbar", label: "Navbar" },
    { value: "hero", label: "Hero" },
    { value: "features", label: "Features" },
    { value: "pricing", label: "Pricing" },
    { value: "testimonials", label: "Testimonials" },
    { value: "cta", label: "CTA" },
    { value: "faq", label: "FAQ" },
    { value: "footer", label: "Footer" },
];

export const defaultRemixSections = ["navbar", "hero", "features", "pricing", "cta", "footer"];

type BusinessCopy = {
    brandName: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
};

const businessCopy: Record<string, BusinessCopy> = {
    saas: {
        brandName: "LaunchKit",
        headline: "Launch your product faster",
        subheadline: "A modern platform for teams building better customer experiences.",
        primaryCta: "Start free",
        secondaryCta: "View demo",
    },
    portfolio: {
        brandName: "Studio North",
        headline: "A focused portfolio for standout creative work",
        subheadline: "Showcase projects, services, and client results with a polished web presence.",
        primaryCta: "View work",
        secondaryCta: "Contact me",
    },
    restaurant: {
        brandName: "Bistro Studio",
        headline: "Fresh dining for every occasion",
        subheadline: "Seasonal dishes, warm hospitality, and memorable tables for friends and family.",
        primaryCta: "Reserve a table",
        secondaryCta: "View menu",
    },
    agency: {
        brandName: "Northstar Agency",
        headline: "Strategy and design for ambitious brands",
        subheadline: "We build campaigns, websites, and systems that help teams grow with confidence.",
        primaryCta: "Book a call",
        secondaryCta: "See services",
    },
    fitness: {
        brandName: "Pulse Fit",
        headline: "Train smarter and feel stronger",
        subheadline: "Personal coaching, group classes, and programs built around real progress.",
        primaryCta: "Start training",
        secondaryCta: "View classes",
    },
    ecommerce: {
        brandName: "Market Lane",
        headline: "Curated products for everyday living",
        subheadline: "Discover thoughtful essentials, fast shipping, and a shopping experience that feels effortless.",
        primaryCta: "Shop now",
        secondaryCta: "Browse collections",
    },
    course: {
        brandName: "SkillSpring",
        headline: "Learn practical skills from expert mentors",
        subheadline: "Structured lessons, guided projects, and resources designed to help you move faster.",
        primaryCta: "Join the course",
        secondaryCta: "See curriculum",
    },
};

const paletteValues = {
    indigo: { primary: "#4f46e5", hover: "#4338ca", accent: "#8b5cf6", bg: "#ffffff", surface: "#f8fafc", text: "#18181b", muted: "#71717a", border: "#e4e4e7", family: "indigo" },
    emerald: { primary: "#059669", hover: "#047857", accent: "#14b8a6", bg: "#ffffff", surface: "#f0fdf4", text: "#172016", muted: "#64748b", border: "#bbf7d0", family: "emerald" },
    rose: { primary: "#e11d48", hover: "#be123c", accent: "#f97316", bg: "#fffafa", surface: "#fff1f2", text: "#1f1718", muted: "#78716c", border: "#fecdd3", family: "rose" },
    amber: { primary: "#d97706", hover: "#b45309", accent: "#f59e0b", bg: "#fffdf5", surface: "#fffbeb", text: "#1c1917", muted: "#78716c", border: "#fde68a", family: "amber" },
    zinc: { primary: "#18181b", hover: "#3f3f46", accent: "#52525b", bg: "#ffffff", surface: "#f4f4f5", text: "#18181b", muted: "#71717a", border: "#d4d4d8", family: "zinc" },
} as const;

const toneValues = {
    modern: { radius: "14px", sectionSpace: "80px", container: "1120px", shadow: "0 16px 50px rgba(15, 23, 42, 0.12)" },
    minimal: { radius: "8px", sectionSpace: "64px", container: "1040px", shadow: "none" },
    bold: { radius: "18px", sectionSpace: "88px", container: "1160px", shadow: "0 20px 60px rgba(0, 0, 0, 0.18)" },
    luxury: { radius: "4px", sectionSpace: "96px", container: "1080px", shadow: "0 18px 60px rgba(28, 25, 23, 0.14)" },
} as const;

export type RemixOptions = {
    businessType: string;
    tone: string;
    palette: string;
    sections: string[];
};

export type RemixResult = {
    html: string;
    css: string;
    selectedBlocks: { section: string; blockId?: string; label: string }[];
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "-");

const aliases: Record<string, string[]> = {
    testimonials: ["testimonials", "social"],
    navbar: ["navbar", "navigation"],
};

function scoreBlock(block: PageBlock, section: string, options: RemixOptions) {
    const category = normalize(block.category || "");
    const tags = (block.tags || []).map(normalize);
    const sectionAliases = aliases[section] || [section];

    if (!sectionAliases.includes(category)) return 0;

    let score = 10;
    if (tags.includes(options.businessType)) score += 3;
    if (tags.includes(options.tone)) score += 3;
    if (tags.includes(options.palette)) score += 2;
    if (tags.includes("modern")) score += 1;
    return score;
}

function pickBlock(blocks: PageBlock[], section: string, options: RemixOptions) {
    return blocks
        .map((block) => ({ block, score: scoreBlock(block, section, options) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.block.label.localeCompare(b.block.label))[0]?.block;
}

function replacePaletteClasses(html: string, palette: string) {
    const family = paletteValues[palette as keyof typeof paletteValues]?.family || "indigo";
    return ["indigo", "violet", "purple", "blue", "sky", "cyan", "emerald", "green", "rose", "red", "amber", "yellow"]
        .reduce((nextHtml, color) => nextHtml.replace(new RegExp(`\\b${color}-(\\d{2,3})\\b`, "g"), `${family}-$1`), html);
}

function applyCopy(html: string, businessType: string) {
    const copy = businessCopy[businessType] || businessCopy.saas;
    return html
        .replace(/WebBuilder/g, copy.brandName)
        .replace(/Build stunning websites without code/g, copy.headline)
        .replace(/Create high-converting pages visually/g, copy.headline)
        .replace(/Design, customize, and publish responsive pages in minutes with a modern visual editor\./g, copy.subheadline)
        .replace(/Drag, drop, and style every section while maintaining production-ready Tailwind output\./g, copy.subheadline)
        .replace(/Build modern websites faster/g, copy.subheadline)
        .replace(/Start free trial/g, copy.primaryCta)
        .replace(/Get started/g, copy.primaryCta)
        .replace(/Create account/g, copy.primaryCta)
        .replace(/Watch demo/g, copy.secondaryCta)
        .replace(/View templates/g, copy.secondaryCta);
}

function buildRootCss(options: RemixOptions) {
    const palette = paletteValues[options.palette as keyof typeof paletteValues] || paletteValues.indigo;
    const tone = toneValues[options.tone as keyof typeof toneValues] || toneValues.modern;

    return `:root {
  --brand-primary: ${palette.primary};
  --brand-primary-hover: ${palette.hover};
  --brand-accent: ${palette.accent};
  --brand-bg: ${palette.bg};
  --brand-surface: ${palette.surface};
  --brand-text: ${palette.text};
  --brand-muted: ${palette.muted};
  --brand-border: ${palette.border};
  --brand-radius: ${tone.radius};
  --brand-section-space: ${tone.sectionSpace};
  --brand-container: ${tone.container};
  --brand-shadow: ${tone.shadow};
}

.remix-page {
  min-height: 100vh;
  background: var(--brand-bg);
  color: var(--brand-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.remix-page section,
.remix-page header,
.remix-page footer {
  border-radius: var(--brand-radius);
}

.remix-page .shadow-lg,
.remix-page .shadow-xl {
  box-shadow: var(--brand-shadow);
}`;
}

export function buildTemplateRemix(blocks: PageBlock[], options: RemixOptions): RemixResult {
    const selected = options.sections
        .map((section) => {
            const block = pickBlock(blocks, section, options);
            if (!block) return null;
            return {
                section,
                blockId: block._id,
                label: block.label,
                html: applyCopy(replacePaletteClasses(block.html, options.palette), options.businessType),
            };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return {
        html: `<main class="remix-page" data-remix-business="${options.businessType}" data-remix-tone="${options.tone}" data-remix-palette="${options.palette}">
${selected.map((item) => item.html).join("\n")}
</main>`,
        css: buildRootCss(options),
        selectedBlocks: selected.map(({ section, blockId, label }) => ({ section, blockId, label })),
    };
}
