import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { applyAppearanceSettings, getUserAppearanceSettings } from "@/lib/appearance";

export function AppearanceSync() {
    const { user, isLoading } = useAuth();

    useEffect(() => {
        const settings = getUserAppearanceSettings(user);

        applyAppearanceSettings(settings);
    }, [isLoading, user]);

    return null;
}
