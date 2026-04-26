/**
 * GrapesJS init options: engine only — no default Block / Style / Layer / Trait UIs.
 * Panels array is empty; appendTo + custom flags prevent hidden managers from rendering.
 */

import type { EditorConfig } from "grapesjs";

export function getHeadlessEditorConfig(container: HTMLElement): EditorConfig {
    return {
        container,
        height: "100%",
        width: "100%",
        fromElement: false,

        /** Custom persistence will replace this later */
        storageManager: false,

        /** Remove default top/left panels (devices, import, etc.) */
        panels: { defaults: [] },

        /** Cloudinary Upload Pipeline Setup */
        assetManager: {
            upload: "http://localhost:8000/api/upload", // We could use env vars but local is hardcoded everywhere else for now
            uploadName: "files",
            credentials: "include", // Required for passing JWT cookie to Node.js
            autoAdd: true,
        },

        /**
         * Block manager: no DOM — we add blocks via editor.addComponents() from React.
         */
        blockManager: {
            appendTo: "",
            custom: true,
        },

        /**
         * Style manager: no DOM — shadcn SettingsPanel applies styles with addStyle().
         */
        styleManager: {
            appendTo: "",
            custom: true,
            sectors: [],
        },

        /** Layer manager: no DOM — React LayersPanel lists the tree */
        layerManager: {
            appendTo: "",
            custom: true,
        },

        /** Trait manager: no DOM */
        traitManager: {
            appendTo: "",
            custom: true,
        },

        /** Selector bar (class/state UI): hidden — selection still works on canvas */
        selectorManager: {
            appendTo: "",
        },

        /** Inject Tailwind CSS into the iframe */
        canvas: {
            scripts: ["https://cdn.tailwindcss.com"],
        },

        /** Styles injected into the canvas iframe */
        canvasCss: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        min-height: 100%;
        font-family: 'Inter', system-ui, sans-serif;
        background: #ffffff;
        color: #0f172a;
        overflow-x: hidden;
      }
      /* Ensure the wrapper component fills the entire canvas area 
         so it acts as a massive drop target for "blank space" */
      [data-gjs-type="wrapper"] { 
        min-height: 100%; 
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        padding: 24px;
      }
    `,
    };
}
