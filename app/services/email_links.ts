/**
 * Matches the href attribute of anchors: group 1 is everything before the
 * value, group 2 the quote and group 3 the value itself.
 */
const ANCHOR_HREF = /(<a\b[^>]*?\bhref\s*=\s*)(["'])(.*?)\2/gis

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/**
 * Only web links are tracked. Mail, phone and anchor links, as well as the
 * unsubscribe and web version links, are left untouched.
 */
export function isTrackableUrl(url: string) {
  return /^https?:\/\//i.test(url.trim())
}

/**
 * Returns the distinct trackable URLs of an HTML document, in order of
 * appearance. URLs may still contain merge tags: they are personalised when
 * the recipient clicks.
 */
export function extractTrackableLinks(html: string) {
  const urls = new Set<string>()
  for (const [, , , rawUrl] of html.matchAll(ANCHOR_HREF)) {
    const url = decodeEntities(rawUrl).trim()
    if (isTrackableUrl(url)) {
      urls.add(url)
    }
  }
  return [...urls]
}

/**
 * Replaces each trackable URL with the one returned by the callback. A
 * callback returning null keeps the original URL.
 */
export function rewriteLinks(html: string, replacer: (url: string) => string | null) {
  return html.replace(ANCHOR_HREF, (match, before: string, quote: string, rawUrl: string) => {
    const url = decodeEntities(rawUrl).trim()
    if (!isTrackableUrl(url)) {
      return match
    }
    const replacement = replacer(url)
    return replacement === null ? match : `${before}${quote}${replacement}${quote}`
  })
}
