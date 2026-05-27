import type { AuthUser } from "@/types/auth.types";

export type ThemeMode = "light" | "dark" | "system";

export interface AppearanceSettings {
    themeMode?: ThemeMode;
    accentTheme?: string;
    stylePreset?: string;
}

const themeStorageKey = "web-builder-accent-theme";
const styleStorageKey = "web-builder-style-preset";

const accentColors = {
    neutral: { primary: "oklch(0.556 0 0)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.97 0 0)", softForeground: "oklch(0.205 0 0)" },
    amber: { primary: "oklch(0.769 0.188 70.08)", foreground: "oklch(0.205 0 0)", soft: "oklch(0.962 0.059 95.62)", softForeground: "oklch(0.279 0.077 45.64)" },
    blue: { primary: "oklch(0.546 0.245 262.88)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.932 0.032 255.59)", softForeground: "oklch(0.282 0.091 267.94)" },
    cyan: { primary: "oklch(0.715 0.143 215.22)", foreground: "oklch(0.205 0 0)", soft: "oklch(0.956 0.045 203.39)", softForeground: "oklch(0.302 0.056 229.70)" },
    emerald: { primary: "oklch(0.596 0.145 163.23)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.95 0.052 163.05)", softForeground: "oklch(0.262 0.051 172.55)" },
    fuchsia: { primary: "oklch(0.667 0.295 322.15)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.952 0.037 318.85)", softForeground: "oklch(0.293 0.136 325.66)" },
    green: { primary: "oklch(0.627 0.194 149.21)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.962 0.044 156.74)", softForeground: "oklch(0.266 0.065 152.93)" },
    indigo: { primary: "oklch(0.511 0.262 276.97)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.93 0.034 272.79)", softForeground: "oklch(0.257 0.09 281.29)" },
    lime: { primary: "oklch(0.768 0.233 130.85)", foreground: "oklch(0.205 0 0)", soft: "oklch(0.967 0.067 122.33)", softForeground: "oklch(0.274 0.072 132.11)" },
    orange: { primary: "oklch(0.705 0.213 47.60)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.954 0.038 75.16)", softForeground: "oklch(0.266 0.079 36.26)" },
    pink: { primary: "oklch(0.656 0.241 354.31)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.948 0.028 342.26)", softForeground: "oklch(0.284 0.109 3.91)" },
    purple: { primary: "oklch(0.558 0.288 302.32)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.946 0.033 307.17)", softForeground: "oklch(0.291 0.149 302.72)" },
    red: { primary: "oklch(0.637 0.237 25.33)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.936 0.032 17.72)", softForeground: "oklch(0.258 0.092 26.04)" },
    rose: { primary: "oklch(0.645 0.246 16.44)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.941 0.03 12.58)", softForeground: "oklch(0.271 0.105 12.09)" },
    sky: { primary: "oklch(0.685 0.169 237.32)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.951 0.026 236.82)", softForeground: "oklch(0.293 0.066 243.16)" },
    teal: { primary: "oklch(0.6 0.118 184.70)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.953 0.051 180.80)", softForeground: "oklch(0.277 0.046 192.52)" },
    violet: { primary: "oklch(0.606 0.25 292.72)", foreground: "oklch(0.985 0 0)", soft: "oklch(0.943 0.029 294.59)", softForeground: "oklch(0.283 0.141 291.09)" },
    yellow: { primary: "oklch(0.795 0.184 86.05)", foreground: "oklch(0.205 0 0)", soft: "oklch(0.973 0.071 103.19)", softForeground: "oklch(0.286 0.066 53.81)" },
} as const;

const stylePresets = {
    vega: { radius: "0.375rem", shadowX: "0px", shadowY: "1px", shadowBlur: "2px", shadowSpread: "0px", shadowOpacity: "0.12" },
    nova: { radius: "0.5rem", shadowX: "0.25px", shadowY: "1px", shadowBlur: "3px", shadowSpread: "0px", shadowOpacity: "0.15" },
    maia: { radius: "0.75rem", shadowX: "0px", shadowY: "4px", shadowBlur: "12px", shadowSpread: "-6px", shadowOpacity: "0.14" },
    lyra: { radius: "1rem", shadowX: "0px", shadowY: "10px", shadowBlur: "24px", shadowSpread: "-14px", shadowOpacity: "0.18" },
    mira: { radius: "0.625rem", shadowX: "0px", shadowY: "6px", shadowBlur: "18px", shadowSpread: "-12px", shadowOpacity: "0.13" },
    luma: { radius: "0.25rem", shadowX: "0px", shadowY: "2px", shadowBlur: "5px", shadowSpread: "-2px", shadowOpacity: "0.1" },
    sera: { radius: "1.25rem", shadowX: "0px", shadowY: "8px", shadowBlur: "18px", shadowSpread: "-10px", shadowOpacity: "0.12" },
    rhea: { radius: "0.125rem", shadowX: "0px", shadowY: "1px", shadowBlur: "1px", shadowSpread: "0px", shadowOpacity: "0.16" },
} as const;

const root = () => document.documentElement;
const setRootColor = (name: string, value: string) => root().style.setProperty(name, value);
const clearRootColor = (name: string) => root().style.removeProperty(name);

export const isThemeMode = (value: unknown): value is ThemeMode => (
    value === "light" || value === "dark" || value === "system"
);

export const getStoredAppearanceSettings = (): Required<AppearanceSettings> => ({
    themeMode: isThemeMode(localStorage.getItem("theme")) ? localStorage.getItem("theme") as ThemeMode : "system",
    accentTheme: localStorage.getItem(themeStorageKey) || "indigo",
    stylePreset: localStorage.getItem(styleStorageKey) || "nova",
});

export const getUserAppearanceSettings = (user: AuthUser | null): Required<AppearanceSettings> => ({
    themeMode: user?.appearanceSettings?.themeMode || getStoredAppearanceSettings().themeMode,
    accentTheme: user?.appearanceSettings?.accentTheme || getStoredAppearanceSettings().accentTheme,
    stylePreset: user?.appearanceSettings?.stylePreset || getStoredAppearanceSettings().stylePreset,
});

export const applyAppearanceSettings = (settings: AppearanceSettings) => {
    const accentName = settings.accentTheme && settings.accentTheme in accentColors ? settings.accentTheme as keyof typeof accentColors : "indigo";
    const styleName = settings.stylePreset && settings.stylePreset in stylePresets ? settings.stylePreset as keyof typeof stylePresets : "nova";
    const accent = accentColors[accentName];
    const style = stylePresets[styleName];

    ["--accent", "--accent-foreground", "--sidebar-accent", "--sidebar-accent-foreground", "--background", "--card", "--popover", "--muted", "--secondary", "--border", "--input", "--sidebar", "--sidebar-border"].forEach(clearRootColor);

    setRootColor("--primary", accent.primary);
    setRootColor("--primary-foreground", accent.foreground);
    setRootColor("--ring", accent.primary);
    setRootColor("--sidebar-primary", accent.primary);
    setRootColor("--sidebar-primary-foreground", accent.foreground);
    setRootColor("--chart-1", accent.soft);
    setRootColor("--chart-2", accent.primary);
    setRootColor("--chart-3", accent.softForeground);
    setRootColor("--chart-4", accent.primary);
    setRootColor("--chart-5", accent.softForeground);
    setRootColor("--shadow-color", accent.primary);
    setRootColor("--radius", style.radius);
    setRootColor("--shadow-x", style.shadowX);
    setRootColor("--shadow-y", style.shadowY);
    setRootColor("--shadow-blur", style.shadowBlur);
    setRootColor("--shadow-spread", style.shadowSpread);
    setRootColor("--shadow-opacity", style.shadowOpacity);

    root().dataset.accentTheme = accentName;
    root().dataset.stylePreset = styleName;
    localStorage.setItem(themeStorageKey, accentName);
    localStorage.setItem(styleStorageKey, styleName);
};
