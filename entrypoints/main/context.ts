import { buildTranslationContext } from "@/entrypoints/utils/context";

const MAX_CONTEXT_LENGTH = 120;
const CONTEXT_TAGS = 'h1, h2, h3, h4, h5, h6, p, li, dd, blockquote, figcaption, div, label';

function compactText(text: string | null | undefined, maxLength: number = MAX_CONTEXT_LENGTH) {
    const compact = (text || "").replace(/\s+/g, ' ').trim();
    if (!compact) return "";
    return compact.length > maxLength ? `${compact.slice(0, maxLength)}...` : compact;
}

function findNearbyNodeText(nodes: Element[], startIndex: number, step: -1 | 1) {
    let index = startIndex + step;
    while (index >= 0 && index < nodes.length) {
        const text = compactText(nodes[index]?.textContent);
        if (text) return text;
        index += step;
    }
    return "";
}

function findNearbyHeading(node: Element) {
    let current: Element | null = node;
    while (current) {
        let sibling: Element | null = current.previousElementSibling;
        while (sibling) {
            if (/^H[1-6]$/.test(sibling.tagName)) {
                const heading = compactText(sibling.textContent, 100);
                if (heading) return heading;
            }
            sibling = sibling.previousElementSibling;
        }
        current = current.parentElement;
    }

    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    for (let index = headings.length - 1; index >= 0; index -= 1) {
        const heading = headings[index];
        const position = heading.compareDocumentPosition(node);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            const text = compactText(heading.textContent, 100);
            if (text) return text;
        }
    }

    return "";
}

function collectContextNodes() {
    return Array.from(document.querySelectorAll(CONTEXT_TAGS)).filter(node => {
        if (!(node instanceof Element)) return false;
        const text = compactText(node.textContent);
        if (!text) return false;
        if (node.classList.contains('notranslate') || node.classList.contains('sr-only')) return false;
        if (node.closest('header, footer, nav, aside, script, style, noscript')) return false;
        if (node.matches('button, input, textarea, select, code, pre')) return false;
        return true;
    });
}

export function buildNodeTranslationContext(node: Element) {
    const nodes = collectContextNodes();
    const index = nodes.indexOf(node);

    const previousText = index >= 0 ? findNearbyNodeText(nodes, index, -1) : "";
    const nextText = index >= 0 ? findNearbyNodeText(nodes, index, 1) : "";
    const nearbyHeading = findNearbyHeading(node);

    return [
        buildTranslationContext(),
        nearbyHeading ? `Nearby heading: ${nearbyHeading}` : "",
        previousText ? `Previous text: ${previousText}` : "",
        nextText ? `Next text: ${nextText}` : "",
    ].filter(Boolean).join('\n');
}
