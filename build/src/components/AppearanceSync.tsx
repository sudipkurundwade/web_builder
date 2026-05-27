import { useEffect } from "react";
import { useTheme } from "next-themes";

import { useAuth } from "@/context/AuthContext";
import { applyAppearanceSettings, getUserAppearanceSettings } from "@/lib/appearance";

export function AppearanceSync() {
    const { user, isLoading } = useAuth();
    const { setTheme } = useTheme();

    useEffect(() => {
        const settings = getUserAppearanceSettings(user);

        applyAppearanceSettings(settings);
        setTheme(settings.themeMode);
        localStorage.setItem("theme", settings.themeMode);
    }, [isLoading, setTheme, user]);

    return null;
}
