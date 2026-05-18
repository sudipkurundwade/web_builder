import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Replicates the backend's naming logic for GitHub Pages.
 * 1. First page is always index.html.
 * 2. Subsequent pages are slugified-name.html.
 */
export function getPageFilename(page: any, index: number): string {
    if (index === 0) return "index.html";
    
    const seo = page.get("seo") || {};
    const name = seo.slug || page.get("slug") || page.get("name") || page.get("id") || `page-${index + 1}`;
    let filename = `${name.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}.html`;
    
    // Prevent non-first pages from being named index.html manually
    if (filename === "index.html") {
        filename = `page-${index + 1}.html`;
    }
    
    return filename;
}
