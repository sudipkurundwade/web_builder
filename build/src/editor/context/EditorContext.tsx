/**
 * Global GrapesJS editor instance for the custom (headless) UI.
 * Canvas.tsx creates the editor and registers it here; toolbars and panels consume it.
 */

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { Editor, Component, Page } from "grapesjs";

export type DeviceId = "Desktop" | "Tablet" | "Mobile portrait";

export interface GrapesEditorContextValue {
    /** Live GrapesJS editor, or null before mount / after destroy */
    editor: Editor | null;
    /** True once grapesjs.init has completed */
    isReady: boolean;
    /** Called from Canvas after init — internal use */
    setEditorInstance: (editor: Editor | null) => void;

    /** ID of the currently selected component (if any) */
    selectedId: string | null;
    setSelectedComponent: (component: Component | null) => void;

    /** Current responsive device applied to the canvas */
    activeDevice: DeviceId;
    setActiveDevice: (device: DeviceId) => void;

    /** Currently selected page ID (Grapes Pages module) */
    currentPageId: string | null;
    setCurrentPage: (page: Page | null) => void;

    /** Toggle for preview mode (hides panels) */
    isPreview: boolean;
    setIsPreview: (value: boolean) => void;
}

const GrapesEditorContext = createContext<GrapesEditorContextValue | null>(null);

export function GrapesEditorProvider({ children }: { children: ReactNode }) {
    const [editor, setEditor] = useState<Editor | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeDevice, setActiveDevice] = useState<DeviceId>("Desktop");
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);
    const [isPreview, setIsPreview] = useState(false);

    const setEditorInstance = useCallback((next: Editor | null) => {
        setEditor(next);
        setIsReady(!!next);
        // When editor is torn down, also clear derived editor state
        if (!next) {
            setSelectedId(null);
            setCurrentPageId(null);
        }
    }, []);

    const setSelectedComponent = useCallback((component: Component | null) => {
        setSelectedId(component ? component.getId?.() ?? null : null);
    }, []);

    const setCurrentPage = useCallback((page: Page | null) => {
        setCurrentPageId(page ? (page.get("id") as string | null) ?? null : null);
    }, []);

    const value = useMemo(
        () => ({
            editor,
            isReady,
            setEditorInstance,
            selectedId,
            setSelectedComponent,
            activeDevice,
            setActiveDevice,
            currentPageId,
            setCurrentPage,
            isPreview,
            setIsPreview,
        }),
        [
            editor,
            isReady,
            selectedId,
            activeDevice,
            currentPageId,
            isPreview,
            setEditorInstance,
            setSelectedComponent,
            setActiveDevice,
            setCurrentPage,
        ],
    );

    return (
        <GrapesEditorContext.Provider value={value}>
            {children}
        </GrapesEditorContext.Provider>
    );
}

/** Consumer hook — colocated with provider for a single import surface. */
// eslint-disable-next-line react-refresh/only-export-components -- hook + provider pattern
export function useGrapesEditor(): GrapesEditorContextValue {
    const ctx = useContext(GrapesEditorContext);
    if (!ctx) {
        throw new Error("useGrapesEditor must be used within GrapesEditorProvider");
    }
    return ctx;
}
