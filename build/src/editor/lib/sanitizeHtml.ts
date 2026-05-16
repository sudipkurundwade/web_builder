const BLOCKED_ELEMENTS = new Set([
    "script",
    "iframe",
    "object",
    "embed",
    "link",
    "meta",
    "base",
    "form",
]);

const URL_ATTRIBUTES = new Set(["href", "src", "xlink:href", "action", "formaction"]);

const isUnsafeUrl = (value: string) => {
    const normalized = value.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
    return normalized.startsWith("javascript:") || normalized.startsWith("data:text/html");
};

export function sanitizeHtml(html: string): string {
    const template = document.createElement("template");
    template.innerHTML = html;

    template.content.querySelectorAll("*").forEach((element) => {
        const tagName = element.tagName.toLowerCase();

        if (BLOCKED_ELEMENTS.has(tagName)) {
            element.remove();
            return;
        }

        Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value;

            if (
                name.startsWith("on") ||
                name === "srcdoc" ||
                (URL_ATTRIBUTES.has(name) && isUnsafeUrl(value))
            ) {
                element.removeAttribute(attribute.name);
            }
        });
    });

    return template.innerHTML;
}
