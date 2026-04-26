import { useGrapesEditor, type DeviceId } from "@/editor/context/EditorContext";
import { Monitor, Tablet, Smartphone } from "lucide-react";

export function BrowserChrome({ projectName: _projectName }: { projectName: string }) {
    const { editor, activeDevice, setActiveDevice, currentPageId, setCurrentPage } = useGrapesEditor();

    const handleDevice = (device: DeviceId) => {
        if (!editor) return;
        editor.setDevice(device);
        setActiveDevice(device);
    };

    const pages = editor?.Pages.getAll() ?? [];

    return (
        <div className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-4 flex-1">
                {/* Mac OS Window Controls */}
                <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-[#ff5f56]" />
                    <div className="size-3 rounded-full bg-[#ffbd2e]" />
                    <div className="size-3 rounded-full bg-[#27c93f]" />
                </div>

                {/* Page Selector */}
                {pages.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs ml-4">
                        <span className="text-muted-foreground font-medium">Page:</span>
                        <div className="relative flex items-center bg-muted/40 hover:bg-muted/80 transition-colors rounded-md border shadow-sm px-1 overflow-hidden">
                            <select
                                className="h-7 w-[120px] bg-transparent border-none font-medium px-2 py-0 text-xs text-foreground focus:ring-0 outline-none cursor-pointer appearance-none"
                                value={currentPageId ?? (pages[0]?.get("id") as string)}
                                onChange={(e) => {
                                    const page = pages.find((p) => (p.get("id") as string) === e.target.value);
                                    if (page && editor) {
                                        editor.Pages.select(page);
                                        setCurrentPage(page);
                                    }
                                }}
                            >
                                {pages.map((page) => {
                                    const id = page.get("id") as string;
                                    const name = (page.get("name") as string) ?? id;
                                    return <option key={id} value={id}>{name}</option>;
                                })}
                            </select>
                            {/* Custom caret */}
                            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Omnibox / URL
            <div className="flex items-center justify-center flex-1 text-[11px] font-medium tracking-wide">
                <span className="text-muted-foreground">sudipkurundwade.wixsite.com/</span>
                <span className="text-foreground">{projectName.toLowerCase().replace(/\s+/g, '-')}</span>
                <span className="ml-3 text-blue-500 cursor-pointer hover:underline transition-all">Connect Domain</span>
            </div> */}

            {/* Device Switcher */}
            <div className="flex items-center justify-end gap-1 flex-1 bg-muted/30 p-1 rounded-lg border shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ml-auto max-w-fit">
                <button
                    onClick={() => handleDevice("Desktop")}
                    className={`flex size-7 items-center justify-center rounded-md transition-all ${activeDevice === "Desktop" ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                    <Monitor className="size-3.5" />
                </button>
                <button
                    onClick={() => handleDevice("Tablet")}
                    className={`flex size-7 items-center justify-center rounded-md transition-all ${activeDevice === "Tablet" ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                    <Tablet className="size-3.5" />
                </button>
                <button
                    onClick={() => handleDevice("Mobile portrait")}
                    className={`flex size-7 items-center justify-center rounded-md transition-all ${activeDevice === "Mobile portrait" ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                    <Smartphone className="size-3.5" />
                </button>
            </div>
        </div>
    );
}
