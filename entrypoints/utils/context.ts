export interface TranslationContextOptions {
    title?: string;
    url?: string;
}

export function buildTranslationContext(options: TranslationContextOptions = {}) {
    const title = options.title ?? document.title;
    const rawUrl = options.url ?? location.href;

    let normalizedUrl = rawUrl;
    try {
        const parsedUrl = new URL(rawUrl);
        parsedUrl.hash = '';
        normalizedUrl = parsedUrl.toString();
    } catch {
        normalizedUrl = rawUrl;
    }

    return [
        `Page title: ${title}`.trim(),
        `URL: ${normalizedUrl}`.trim(),
    ].join('\n');
}
