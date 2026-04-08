/**
 * AssetPanel
 * ----------
 * Simple asset gallery built on top of GrapesJS AssetManager.
 * Upload is mocked for now (placeholder URLs) but the API is ready for Cloudinary.
 */

import { useEffect, useReducer } from "react";
import type { Asset } from "grapesjs";
import { ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGrapesEditor } from "@/editor/context/EditorContext";

const MOCK_IMAGES = [
    "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=800&q=80",
    "https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?w=800&q=80",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
];

export function AssetPanel() {
    const { editor, isReady } = useGrapesEditor();
    const [, force] = useReducer((x: number) => x + 1, 0);

    useEffect(() => {
        if (!editor) return;
        const rerender = () => force();
        editor.on("asset:add", rerender);
        editor.on("asset:remove", rerender);
        return () => {
            editor.off("asset:add", rerender);
            editor.off("asset:remove", rerender);
        };
    }, [editor]);

    if (!isReady || !editor) {
        return (
            <p className="p-3 text-xs text-muted-foreground">
                Editor not ready. Open a project to manage assets.
            </p>
        );
    }

    const manager = editor.AssetManager;
    const assets = manager.getAll() as Asset[];

    const mockUpload = () => {
        const src = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
        manager.add({ src, type: "image" });
        force();
    };

    const applyToSelection = (asset: Asset) => {
        const selected = editor.getSelected();
        if (!selected) return;

        const src = asset.get("src") as string;
        const type = selected.get("type") as string | undefined;

        if (type === "image") {
            selected.addAttributes({ src });
        } else {
            const traits = selected.getTraits();
            const srcTrait = traits.find((t) => t.get("name") === "src");
            if (srcTrait) {
                srcTrait.set("value", src);
            } else {
                selected.addAttributes({ src });
            }
        }
    };

    return (
        <div className="space-y-3 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-muted-foreground">Assets</span>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-[11px]"
                    onClick={mockUpload}
                >
                    <Plus className="size-3" />
                    Mock upload
                </Button>
            </div>

            {assets.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                    No assets yet. Use &quot;Mock upload&quot; to add example images.
                </p>
            )}

            <div className="grid grid-cols-3 gap-2">
                {assets.map((asset) => {
                    const src = asset.get("src") as string;
                    return (
                        <button
                            key={asset.cid}
                            type="button"
                            onClick={() => applyToSelection(asset)}
                            className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                        >
                            {src ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={src}
                                    alt=""
                                    className="h-full w-full object-cover transition group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <ImageIcon className="size-5" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

