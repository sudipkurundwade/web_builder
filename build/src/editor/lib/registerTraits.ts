/**
 * registerComponentTraits
 * -----------------------
 * Adds custom traits to GrapesJS built-in component types:
 *
 *  - link   → href, target, title
 *  - image  → src, alt, width, height
 *  - button → text, href, style-type
 *  - text   → content (textarea)
 *
 * Call this function once, immediately after grapesjs.init() returns.
 *
 * Usage:
 *   import { registerComponentTraits } from "@/editor/lib/registerTraits";
 *   registerComponentTraits(editor);
 */

import type { Editor } from "grapesjs";

export function registerComponentTraits(editor: Editor): void {
    const { DomComponents } = editor;

    // ─── Link component ───────────────────────────────────────────────────────
    // Adds href, target and title controls to any <a> element on the canvas.
    DomComponents.addType("link", {
        model: {
            defaults: {
                traits: [
                    {
                        type:        "href",          // renders as <input type="url">
                        label:       "URL (href)",
                        name:        "href",
                        placeholder: "https://example.com",
                    },
                    {
                        type:    "select",             // renders as <select>
                        label:   "Open in",
                        name:    "target",
                        options: [
                            { id: "_self",   label: "Same tab"  },
                            { id: "_blank",  label: "New tab"   },
                            { id: "_parent", label: "Parent"    },
                        ],
                    },
                    {
                        type:        "text",           // renders as <input type="text">
                        label:       "Title (tooltip)",
                        name:        "title",
                        placeholder: "Hover tooltip text",
                    },
                ],
            },
        },
    });

    // ─── Image component ──────────────────────────────────────────────────────
    // Controls src, alt text, and explicit width / height attributes.
    DomComponents.addType("image", {
        model: {
            defaults: {
                traits: [
                    {
                        type:        "href",
                        label:       "Image URL (src)",
                        name:        "src",
                        placeholder: "https://example.com/image.png",
                    },
                    {
                        type:        "text",
                        label:       "Alt text",
                        name:        "alt",
                        placeholder: "Describe the image",
                    },
                    {
                        type:        "number",         // renders as <input type="number">
                        label:       "Width (px)",
                        name:        "width",
                        placeholder: "e.g. 800",
                    },
                    {
                        type:        "number",
                        label:       "Height (px)",
                        name:        "height",
                        placeholder: "e.g. 600",
                    },
                ],
            },
        },
    });

    // ─── Button component ─────────────────────────────────────────────────────
    // Lets the user control the button label, its href, and a style-type.
    DomComponents.addType("button", {
        model: {
            defaults: {
                traits: [
                    {
                        type:        "text",
                        label:       "Button label",
                        name:        "content",     // maps to inner HTML content
                        placeholder: "Click me",
                    },
                    {
                        type:        "href",
                        label:       "Link (href)",
                        name:        "href",
                        placeholder: "https://...",
                    },
                    {
                        type:    "select",
                        label:   "Style type",
                        name:    "data-style",
                        options: [
                            { id: "primary",   label: "Primary"   },
                            { id: "secondary", label: "Secondary" },
                            { id: "outline",   label: "Outline"   },
                            { id: "ghost",     label: "Ghost"     },
                        ],
                    },
                ],
            },
        },
    });

    // ─── Text component ───────────────────────────────────────────────────────
    // Exposes the inner text content through a textarea trait.
    DomComponents.addType("text", {
        model: {
            defaults: {
                traits: [
                    {
                        type:        "textarea",     // renders as a <textarea>
                        label:       "Text content",
                        name:        "content",
                        placeholder: "Enter your text here…",
                    },
                ],
            },
        },
    });
}
