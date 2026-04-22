/**
 * HTML strings passed to editor.addComponents() for the block sidebar.
 * Kept separate from UI so blocks stay easy to extend or load from a CMS later.
 */

/** Full-width hero with gradient background */
export const BLOCK_HERO = `
<section data-block="hero" style="padding:96px 24px;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);text-align:center;">
  <h1 style="font-size:2.5rem;font-weight:800;color:#ffffff;margin:0 0 16px;line-height:1.15;">Your headline</h1>
  <p style="font-size:1.1rem;color:rgba(255,255,255,0.9);margin:0 0 28px;max-width:560px;margin-left:auto;margin-right:auto;">Supporting copy goes here. Select any element to style it in the right panel.</p>
  <a href="#" style="display:inline-block;padding:14px 28px;background:#ffffff;color:#4f46e5;border-radius:8px;font-weight:700;text-decoration:none;font-size:1rem;">Call to action</a>
</section>
`.trim();

/** Editable paragraph */
export const BLOCK_TEXT = `
<div data-block="text" style="padding:16px 8px;">
  <p style="margin:0;font-size:16px;line-height:1.65;color:#1e293b;">Click this text on the canvas to edit. Use the Style panel for colors and typography.</p>
</div>
`.trim();

/** Responsive image with placeholder asset */
export const BLOCK_IMAGE = `
<div data-block="image" style="padding:16px 8px;">
  <img
    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    alt="Placeholder"
    style="display:block;max-width:100%;height:auto;border-radius:10px;"
  />
</div>
`.trim();

/** Simple navbar with logo + links */
export const BLOCK_NAVBAR = `
<header data-block="navbar" style="padding:16px 24px;border-bottom:1px solid #e2e8f0;background:#ffffff;">
  <nav style="max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:999px;background:#4f46e5;"></div>
      <span style="font-weight:700;color:#0f172a;">Brand</span>
    </div>
    <div style="display:flex;gap:16px;font-size:14px;color:#64748b;">
      <a href="#" style="text-decoration:none;color:inherit;">Features</a>
      <a href="#" style="text-decoration:none;color:inherit;">Pricing</a>
      <a href="#" style="text-decoration:none;color:inherit;">Docs</a>
    </div>
  </nav>
</header>
`.trim();

/** Footer with simple links */
export const BLOCK_FOOTER = `
<footer data-block="footer" style="padding:32px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
  <div style="max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:13px;color:#64748b;">
    <span>© ${new Date().getFullYear()} Your company</span>
    <div style="display:flex;gap:12px;">
      <a href="#" style="text-decoration:none;color:inherit;">Privacy</a>
      <a href="#" style="text-decoration:none;color:inherit;">Terms</a>
      <a href="#" style="text-decoration:none;color:inherit;">Contact</a>
    </div>
  </div>
</footer>
`.trim();

/** Two-column grid section */
export const BLOCK_GRID = `
<section data-block="grid" style="padding:56px 24px;background:#ffffff;">
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;">
    <div style="padding:20px;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;">
      <h3 style="margin:0 0 8px;font-weight:600;color:#0f172a;">Card title</h3>
      <p style="margin:0;font-size:14px;color:#64748b;">Short description for this feature.</p>
    </div>
    <div style="padding:20px;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;">
      <h3 style="margin:0 0 8px;font-weight:600;color:#0f172a;">Card title</h3>
      <p style="margin:0;font-size:14px;color:#64748b;">Short description for this feature.</p>
    </div>
    <div style="padding:20px;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;">
      <h3 style="margin:0 0 8px;font-weight:600;color:#0f172a;">Card title</h3>
      <p style="margin:0;font-size:14px;color:#64748b;">Short description for this feature.</p>
    </div>
  </div>
</section>
`.trim();

/** Single button */
export const BLOCK_BUTTON = `
<a data-block="button" href="#" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#4f46e5;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;">
  Button
</a>
`.trim();

/** Simple contact form */
export const BLOCK_FORM = `
<section data-block="form" style="padding:48px 24px;background:#ffffff;">
  <form style="max-width:480px;margin:0 auto;display:flex;flex-direction:column;gap:12px;">
    <label style="font-size:14px;color:#0f172a;">
      Email
      <input type="email" name="email" placeholder="you@example.com" style="margin-top:4px;width:100%;padding:8px 10px;border-radius:8px;border:1px solid #cbd5f5;" />
    </label>
    <label style="font-size:14px;color:#0f172a;">
      Message
      <textarea name="message" rows="4" placeholder="How can we help?" style="margin-top:4px;width:100%;padding:8px 10px;border-radius:8px;border:1px solid #cbd5f5;resize:vertical;"></textarea>
    </label>
    <button type="submit" style="margin-top:4px;display:inline-flex;justify-content:center;padding:10px 18px;border-radius:999px;border:none;background:#4f46e5;color:#ffffff;font-weight:600;font-size:14px;cursor:pointer;">
      Submit
    </button>
  </form>
</section>
`.trim();

export const BLOCKS_LAYOUT = [
    {
        id: "navbar",
        label: "Navbar",
        description: "Brand logo with navigation links",
        html: BLOCK_NAVBAR,
        preview: "Top navigation bar with logo and links.",
    },
    {
        id: "hero",
        label: "Hero section",
        description: "Headline, text, and call-to-action",
        html: BLOCK_HERO,
        preview: "Large hero section with gradient background.",
    },
    {
        id: "grid",
        label: "Feature grid",
        description: "Three-column features layout",
        html: BLOCK_GRID,
        preview: "Responsive grid of feature cards.",
    },
] as const;

export const BLOCKS_BASIC = [
    {
        id: "text",
        label: "Text block",
        description: "Paragraph of body copy",
        html: BLOCK_TEXT,
        preview: "Single paragraph of text.",
    },
    {
        id: "button",
        label: "Button",
        description: "Standalone call-to-action button",
        html: BLOCK_BUTTON,
        preview: "Rounded primary button.",
    },
] as const;

export const BLOCKS_MEDIA = [
    {
        id: "image",
        label: "Image",
        description: "Responsive image with rounded corners",
        html: BLOCK_IMAGE,
        preview: "Full-width responsive image.",
    },
] as const;

export const BLOCKS_FORMS = [
    {
        id: "form",
        label: "Contact form",
        description: "Email and message fields with submit button",
        html: BLOCK_FORM,
        preview: "Centered contact form.",
    },
    {
        id: "footer",
        label: "Footer",
        description: "Footer bar with links",
        html: BLOCK_FOOTER,
        preview: "Bottom footer with legal links.",
    },
] as const;
