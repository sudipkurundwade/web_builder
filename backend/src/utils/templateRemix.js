const DEFAULT_SECTIONS = ["navbar", "hero", "features", "pricing", "cta", "footer"];

const SECTION_ALIASES = {
    testimonials: ["testimonials", "social"],
    footer: ["footer"],
    navbar: ["navbar", "navigation"],
};

const BUSINESS_PRESETS = {
    saas: {
        brandName: "LaunchKit",
        headline: "Launch your product faster",
        subheadline: "A modern platform for teams building better customer experiences.",
        primaryCta: "Start free",
        secondaryCta: "View demo",
        navItems: ["Features", "Pricing", "Templates"],
    },
    portfolio: {
        brandName: "Studio North",
        headline: "A focused portfolio for standout creative work",
        subheadline: "Showcase projects, services, and client results with a polished web presence.",
        primaryCta: "View work",
        secondaryCta: "Contact me",
        navItems: ["Work", "About", "Contact"],
    },
    restaurant: {
        brandName: "Bistro Studio",
        headline: "Fresh dining for every occasion",
        subheadline: "Seasonal dishes, warm hospitality, and memorable tables for friends and family.",
        primaryCta: "Reserve a table",
        secondaryCta: "View menu",
        navItems: ["Menu", "Reservations", "Location"],
    },
    agency: {
        brandName: "Northstar Agency",
        headline: "Strategy and design for ambitious brands",
        subheadline: "We build campaigns, websites, and systems that help teams grow with confidence.",
        primaryCta: "Book a call",
        secondaryCta: "See services",
        navItems: ["Services", "Work", "Contact"],
    },
    fitness: {
        brandName: "Pulse Fit",
        headline: "Train smarter and feel stronger",
        subheadline: "Personal coaching, group classes, and programs built around real progress.",
        primaryCta: "Start training",
        secondaryCta: "View classes",
        navItems: ["Programs", "Coaches", "Pricing"],
    },
    ecommerce: {
        brandName: "Market Lane",
        headline: "Curated products for everyday living",
        subheadline: "Discover thoughtful essentials, fast shipping, and a shopping experience that feels effortless.",
        primaryCta: "Shop now",
        secondaryCta: "Browse collections",
        navItems: ["Shop", "Collections", "Support"],
    },
    course: {
        brandName: "SkillSpring",
        headline: "Learn practical skills from expert mentors",
        subheadline: "Structured lessons, guided projects, and resources designed to help you move faster.",
        primaryCta: "Join the course",
        secondaryCta: "See curriculum",
        navItems: ["Curriculum", "Reviews", "Pricing"],
    },
};

const PALETTES = {
    indigo: {
        primary: "#4f46e5",
        primaryHover: "#4338ca",
        accent: "#8b5cf6",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#18181b",
        muted: "#71717a",
        border: "#e4e4e7",
        family: "indigo",
    },
    emerald: {
        primary: "#059669",
        primaryHover: "#047857",
        accent: "#14b8a6",
        background: "#ffffff",
        surface: "#f0fdf4",
        text: "#172016",
        muted: "#64748b",
        border: "#bbf7d0",
        family: "emerald",
    },
    rose: {
        primary: "#e11d48",
        primaryHover: "#be123c",
        accent: "#f97316",
        background: "#fffafa",
        surface: "#fff1f2",
        text: "#1f1718",
        muted: "#78716c",
        border: "#fecdd3",
        family: "rose",
    },
    amber: {
        primary: "#d97706",
        primaryHover: "#b45309",
        accent: "#f59e0b",
        background: "#fffdf5",
        surface: "#fffbeb",
        text: "#1c1917",
        muted: "#78716c",
        border: "#fde68a",
        family: "amber",
    },
    zinc: {
        primary: "#18181b",
        primaryHover: "#3f3f46",
        accent: "#52525b",
        background: "#ffffff",
        surface: "#f4f4f5",
        text: "#18181b",
        muted: "#71717a",
        border: "#d4d4d8",
        family: "zinc",
    },
};

const TONES = {
    modern: {
        radius: "14px",
        sectionSpace: "80px",
        container: "1120px",
        shadow: "0 16px 50px rgba(15, 23, 42, 0.12)",
    },
    minimal: {
        radius: "8px",
        sectionSpace: "64px",
        container: "1040px",
        shadow: "none",
    },
    bold: {
        radius: "18px",
        sectionSpace: "88px",
        container: "1160px",
        shadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
    },
    luxury: {
        radius: "4px",
        sectionSpace: "96px",
        container: "1080px",
        shadow: "0 18px 60px rgba(28, 25, 23, 0.14)",
    },
};

const normalize = (value, fallback) =>
    String(value || fallback)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

const getPreset = (collection, key, fallback) => collection[key] || collection[fallback];

const normalizeSections = (sections) => {
    if (!Array.isArray(sections) || sections.length === 0) return DEFAULT_SECTIONS;
    return sections.map((section) => normalize(section, "")).filter(Boolean);
};

const scoreBlock = (block, section, options) => {
    const aliases = SECTION_ALIASES[section] || [section];
    const category = normalize(block.category, "");
    const tags = (block.tags || []).map((tag) => normalize(tag, ""));

    let score = aliases.includes(category) ? 10 : 0;
    if (!score) return 0;

    if (tags.includes(options.businessType)) score += 3;
    if (tags.includes(options.tone)) score += 3;
    if (tags.includes(options.palette)) score += 2;
    if (tags.includes("modern")) score += 1;

    return score;
};

const selectBlockForSection = (blocks, section, options) => {
    const ranked = blocks
        .map((block) => ({ block, score: scoreBlock(block, section, options) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.block.label.localeCompare(b.block.label));

    return ranked[0]?.block || null;
};

const replacePaletteClasses = (html, paletteFamily) => {
    const colorFamilies = ["indigo", "violet", "purple", "blue", "sky", "cyan", "emerald", "green", "rose", "red", "amber", "yellow"];
    return colorFamilies.reduce((nextHtml, family) => {
        const pattern = new RegExp(`\\b${family}-(\\d{2,3})\\b`, "g");
        return nextHtml.replace(pattern, `${paletteFamily}-$1`);
    }, html);
};

const applyBusinessCopy = (html, copy) => {
    const navMarkup = copy.navItems.map((item) => `<a href="#">${item}</a>`).join("");

    return html
        .replace(/WebBuilder/g, copy.brandName)
        .replace(/Build stunning websites without code/g, copy.headline)
        .replace(/Create high-converting pages visually/g, copy.headline)
        .replace(/Build modern websites faster/g, copy.subheadline)
        .replace(/Design, customize, and publish responsive pages in minutes with a modern visual editor\./g, copy.subheadline)
        .replace(/Drag, drop, and style every section while maintaining production-ready Tailwind output\./g, copy.subheadline)
        .replace(/Start free trial/g, copy.primaryCta)
        .replace(/Get started/g, copy.primaryCta)
        .replace(/Create account/g, copy.primaryCta)
        .replace(/Watch demo/g, copy.secondaryCta)
        .replace(/View templates/g, copy.secondaryCta)
        .replace(/Features<\/a><a href="#">Pricing<\/a><a href="#">Templates/g, `${navMarkup.replace(/<a href="#">/, "").replace(/<\/a>$/, "")}`);
};

const transformBlockHtml = (html, options) => {
    const copy = getPreset(BUSINESS_PRESETS, options.businessType, "saas");
    const palette = getPreset(PALETTES, options.palette, "indigo");
    return applyBusinessCopy(replacePaletteClasses(html, palette.family), copy);
};

const buildRootCss = ({ palette, tone }) => {
    const palettePreset = getPreset(PALETTES, palette, "indigo");
    const tonePreset = getPreset(TONES, tone, "modern");

    return `:root {
  --brand-primary: ${palettePreset.primary};
  --brand-primary-hover: ${palettePreset.primaryHover};
  --brand-accent: ${palettePreset.accent};
  --brand-bg: ${palettePreset.background};
  --brand-surface: ${palettePreset.surface};
  --brand-text: ${palettePreset.text};
  --brand-muted: ${palettePreset.muted};
  --brand-border: ${palettePreset.border};
  --brand-radius: ${tonePreset.radius};
  --brand-section-space: ${tonePreset.sectionSpace};
  --brand-container: ${tonePreset.container};
  --brand-shadow: ${tonePreset.shadow};
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
}

.remix-page a {
  color: inherit;
}

.remix-page button {
  border-radius: var(--brand-radius);
}`;
};

const buildRemixProject = (blocks, rawOptions = {}) => {
    const options = {
        businessType: normalize(rawOptions.businessType, "saas"),
        tone: normalize(rawOptions.tone, "modern"),
        palette: normalize(rawOptions.palette, "indigo"),
        sections: normalizeSections(rawOptions.sections),
    };

    const selected = options.sections
        .map((section) => {
            const block = selectBlockForSection(blocks, section, options);
            if (!block) return null;
            return {
                section,
                blockId: block._id?.toString(),
                label: block.label,
                html: transformBlockHtml(block.html, options),
            };
        })
        .filter(Boolean);

    const html = `<main class="remix-page" data-remix-business="${options.businessType}" data-remix-tone="${options.tone}" data-remix-palette="${options.palette}">
${selected.map((item) => item.html).join("\n")}
</main>`;

    return {
        html,
        css: buildRootCss(options),
        options,
        selectedBlocks: selected.map(({ section, blockId, label }) => ({ section, blockId, label })),
    };
};

export {
    BUSINESS_PRESETS,
    DEFAULT_SECTIONS,
    PALETTES,
    TONES,
    buildRemixProject,
};
