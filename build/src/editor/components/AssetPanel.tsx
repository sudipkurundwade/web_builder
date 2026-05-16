/**
 * AssetPanel
 * ----------
 * Asset gallery built on top of GrapesJS AssetManager.
 * Uploads images to Cloudinary via the backend and registers
 * them in the editor so they can be dragged onto the canvas or
 * applied to a selected component.
 */

import { useEffect, useReducer, useRef, useState } from "react";
import type { Asset } from "grapesjs";
import { ImageIcon, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGrapesEditor } from "@/editor/context/EditorContext";
import { uploadImages } from "@/services/uploadService";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

export function AssetPanel() {
    const { editor, isReady } = useGrapesEditor();
    const [, force] = useReducer((x: number) => x + 1, 0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    /**
     * Trigger the hidden file input.
     */
    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    /**
     * Handle files selected from the native file picker.
     * Uploads to Cloudinary, then registers in the GrapesJS AssetManager.
     */
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const files = Array.from(fileList);
        setIsUploading(true);
        setUploadError(null);

        try {
            const urls = await uploadImages(files);

            // Register each URL in the GrapesJS AssetManager
            urls.forEach((url) => {
                manager.add({ src: url, type: "image" });
            });

            force();
        } catch (err: any) {
            console.error("Upload failed:", err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Upload failed. Please try again.";
            setUploadError(msg);
        } finally {
            setIsUploading(false);
            // Reset the input so the same file can be selected again
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    /**
     * Click an asset → apply its URL to the currently selected canvas component.
     */
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

    /**
     * Remove an asset from the GrapesJS AssetManager.
     */
    const removeAsset = (asset: Asset, e: React.MouseEvent) => {
        e.stopPropagation(); // don't trigger applyToSelection
        manager.remove(asset);
        force();
    };

    return (
        <div className="space-y-3 p-3 text-xs">
            {/* Header + Upload button */}
            <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-muted-foreground">Assets</span>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-[11px]"
                    onClick={openFilePicker}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : (
                        <Upload className="size-3" />
                    )}
                    {isUploading ? "Uploading…" : "Upload"}
                </Button>

                {/* Hidden native file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Upload error */}
            {uploadError && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-600">
                    {uploadError}
                </div>
            )}

            {/* Empty state */}
            {assets.length === 0 && !isUploading && (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 py-6 text-center">
                    <ImageIcon className="size-8 text-muted-foreground/40" />
                    <p className="text-[11px] text-muted-foreground">
                        No assets yet. Click &quot;Upload&quot; to add images.
                    </p>
                </div>
            )}

            {/* Uploading indicator */}
            {isUploading && (
                <div className="flex items-center gap-2 rounded-md border border-violet-500/30 bg-violet-500/10 px-2.5 py-2">
                    <Loader2 className="size-3.5 animate-spin text-violet-500" />
                    <span className="text-[11px] text-violet-600">Uploading to Cloudinary…</span>
                </div>
            )}

            {/* Asset grid */}
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

                            {/* Delete overlay — visible on hover */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={(e) => removeAsset(asset, e)}
                                    className="rounded-full bg-red-500/90 p-1.5 text-white hover:bg-red-600 transition-colors"
                                    title="Remove asset"
                                >
                                    <Trash2 className="size-3" />
                                </button>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
