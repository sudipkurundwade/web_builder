/**
 * Mount point for the GrapesJS canvas iframe only.
 * Initializes the editor once per mount and publishes the instance via GrapesEditorContext.
 */

import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import { useGrapesEditor } from "@/editor/context/EditorContext";
import { getHeadlessEditorConfig } from "@/editor/lib/grapesEditorConfig";
import { registerComponentTraits } from "@/editor/lib/registerTraits";

export function Canvas() {
    const hostRef = useRef<HTMLDivElement>(null);
    const { setEditorInstance } = useGrapesEditor();

    useEffect(() => {
        const el = hostRef.current;
        if (!el) return;

        const editor = grapesjs.init(getHeadlessEditorConfig(el));
        
        // Register custom component traits (link, image, button, text properties)
        registerComponentTraits(editor);
        
        setEditorInstance(editor);

        return () => {
            editor.destroy();
            setEditorInstance(null);
        };
    }, [setEditorInstance]);

    return (
        <>
            <div
                ref={hostRef}
                className="gjs-canvas-host min-h-0 flex-1 overflow-hidden bg-muted/40"
            />
            {/* Scoped canvas chrome — not GrapesJS panels */}
            <style>{`
        /* Hide GrapesJS built-in panel chrome — we use our own React sidebars/toolbar */
        /* NOTE: .gjs-toolbar is intentionally NOT here — it's the floating component
           action bar (Move / Duplicate / Delete) that must stay visible on the canvas */
        .gjs-canvas-host .gjs-pn-panels,
        .gjs-canvas-host .gjs-pn-panel,
        .gjs-canvas-host .gjs-pn-views,
        .gjs-canvas-host .gjs-pn-views-container {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        /* GrapesJS editor wrapper — full host size */
        .gjs-canvas-host .gjs-editor {
          width: 100% !important;
          height: 100% !important;
        }
        /* Canvas iframe — fill the entire editor, no offset from hidden panels */
        .gjs-canvas-host .gjs-cv-canvas {
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: hsl(var(--muted) / 0.5);
        }
        .gjs-canvas-host .gjs-frame { border-radius: 8px; }
        
        /* Stylize GrapesJS Resizer handles to match our theme */
        .gjs-resizer-hdl {
          border-color: #6366f1 !important; /* Indigo-500 */
          background-color: #ffffff !important;
          box-shadow: 0 0 4px rgba(99, 102, 241, 0.4);
        }
        .gjs-resizer-hdl:hover {
          background-color: #6366f1 !important;
        }
      `}</style>
        </>
    );
}
