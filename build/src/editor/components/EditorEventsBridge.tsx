/**
 * Subscribes to GrapesJS events and keeps EditorContext in sync:
 *  - selected component ID
 *  - current device
 *  - current page ID
 *
 * This component should be rendered once inside GrapesEditorProvider.
 */

import { useEffect } from "react";
import type { Page } from "grapesjs";
import { useGrapesEditor, type DeviceId } from "@/editor/context/EditorContext";
import { getPageFilename } from "@/lib/utils";

export function EditorEventsBridge() {
    const {
        editor,
        isReady,
        setSelectedComponent,
        setActiveDevice,
        setCurrentPage,
        isPreview,
    } = useGrapesEditor();

    // Sync initial device + page when editor becomes ready
    useEffect(() => {
        if (!isReady || !editor) return;

        const dev = editor.getDevice() as DeviceId | string;
        if (dev === "Tablet" || dev === "Mobile portrait" || dev === "Desktop") {
            setActiveDevice(dev);
        }

        const currentPage = editor.Pages.getSelected();
        if (currentPage) setCurrentPage(currentPage as Page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, editor]);

    // Component selection changes
    useEffect(() => {
        if (!editor) return;
        const onSelected = (component: any) => {
            if (component) {
                // Using standard GrapesJS resizer positions:
                // tc (top-center), bc (bottom-center), cl (center-left), cr (center-right)
                component.set("resizable", {
                    pos: ["tc", "bc", "cl", "cr", "tl", "tr", "bl", "br"],
                });
            }
            setSelectedComponent(component ?? null);
        };
        const onDeselected = () => setSelectedComponent(null);

        editor.on("component:selected", onSelected);
        editor.on("component:deselected", onDeselected);

        return () => {
            editor.off("component:selected", onSelected);
            editor.off("component:deselected", onDeselected);
        };
    }, [editor, setSelectedComponent]);

    // Page changes
    useEffect(() => {
        if (!editor) return;
        const onPageSelect = (page: any) => setCurrentPage(page ?? null);
        const onPageUpdate = (page: any) => {
            // Keep ID in sync if it changes (rare)
            setCurrentPage(page ?? null);
        };

        editor.on("page:select", onPageSelect);
        editor.on("page:update", onPageUpdate);
        editor.on("page:add", onPageUpdate);

        return () => {
            editor.off("page:select", onPageSelect);
            editor.off("page:update", onPageUpdate);
            editor.off("page:add", onPageUpdate);
        };
    }, [editor, setCurrentPage]);
    
    // Intercept clicks in preview mode for internal navigation
    useEffect(() => {
        if (!editor || !isReady || !isPreview) return;

        const handleCanvasClick = (e: MouseEvent) => {
            // Find the closest anchor tag
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (link) {
                const href = link.getAttribute("href");
                if (!href) return;

                if (href.startsWith("#")) {
                    e.preventDefault();
                    const pageId = href.substring(1);
                    const pages = editor.Pages.getAll();
                    const targetPage = pages.find((p) => p.get("id") === pageId);
                    
                    if (targetPage) {
                        editor.Pages.select(targetPage);
                    }
                } 
                // Case 2: Internal filename link (e.g. contact.html)
                else if (href.endsWith(".html") && !href.startsWith("http")) {
                    e.preventDefault();
                    const pages = editor.Pages.getAll();
                    let matchFound = false;
                    
                    pages.forEach((p, idx) => {
                        if (matchFound) return;
                        const filename = getPageFilename(p, idx);
                        if (filename === href) {
                            editor.Pages.select(p);
                            matchFound = true;
                        }
                    });
                }
                // Case 3: External link
                else if (href.startsWith("http")) {
                    e.preventDefault();
                    window.open(href, "_blank");
                }
            }
        };

        const body = editor.Canvas.getBody();
        body.addEventListener("click", handleCanvasClick);

        return () => {
            body.removeEventListener("click", handleCanvasClick);
        };
    }, [editor, isReady, isPreview]);

    return null;
}

