import { escapeHtml } from '#services/merge_tags'
import type { AppSettings } from '#services/settings_service'

type Company = Pick<AppSettings, 'companyName' | 'companyAddress'>

/**
 * Hidden text shown by most inboxes next to the subject.
 */
function preheaderBlock(preheader: string | null) {
  if (!preheader) return ''
  return `<div class="preheader" style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">${escapeHtml(preheader)}</div>`
}

/**
 * Legal footer with the unsubscribe link, added to every campaign.
 */
export function footerBlock(company: Company) {
  const address = company.companyAddress
    ? `<br>${escapeHtml(company.companyAddress).replace(/\r?\n/g, '<br>')}`
    : ''

  return `<div class="footer">
  <p><strong>${escapeHtml(company.companyName)}</strong>${address}</p>
  <a href="{{ unsubscribe_url }}">Se désinscrire</a> · <a href="{{ web_version_url }}">Voir dans le navigateur</a></p>
</div>`
}

const STYLES = `
  body { margin: 0; padding: 0; background: #f2f3f5; -webkit-text-size-adjust: 100%; }
  .wrapper { background: #f2f3f5; padding: 32px 12px; }
  .container { max-width: 600px; margin: 0 auto; }
  .card { background: #ffffff; border-radius: 12px; border: 1px solid #e4e6ea; padding: 40px 44px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1d1f23; }
  .card h1 { font-size: 26px; line-height: 1.25; margin: 0 0 16px; color: #0a0a0b; }
  .card h2 { font-size: 21px; line-height: 1.3; margin: 28px 0 12px; color: #0a0a0b; }
  .card h3 { font-size: 17px; line-height: 1.4; margin: 24px 0 8px; color: #0a0a0b; }
  .card p { margin: 0 0 16px; }
  .card a { color: #2f5bea; text-decoration: underline; }
  .card ul, .card ol { margin: 0 0 16px; padding-left: 24px; }
  .card li { margin: 0 0 6px; }
  .card blockquote { margin: 0 0 16px; padding: 4px 0 4px 16px; border-left: 3px solid #d5d8de; color: #4a4e56; }
  .card img { max-width: 100%; height: auto; border: 0; border-radius: 6px; }
  .card hr { border: 0; border-top: 1px solid #e4e6ea; margin: 28px 0; }
  .card code { font-family: Menlo, Consolas, monospace; font-size: 14px; background: #f2f3f5; padding: 2px 5px; border-radius: 4px; }
  .footer { padding: 24px 12px 0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #8a8f98; }
  .footer p { margin: 0 0 8px; }
  .footer a { color: #8a8f98; text-decoration: underline; }
  @media only screen and (max-width: 620px) {
    .wrapper { padding: 16px 8px !important; }
    .card { padding: 28px 22px !important; }
  }
`

/**
 * Wraps the content written with the visual editor in a responsive layout.
 */
export function visualLayout(content: string, preheader: string | null, company: Company) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<style>${STYLES}</style>
</head>
<body>
${preheaderBlock(preheader)}
<div class="wrapper">
  <div class="container">
    <div class="card">
${content}
    </div>
    ${footerBlock(company)}
  </div>
</div>
</body>
</html>`
}

/**
 * HTML written by hand is kept as is. The preheader is added after the
 * opening body tag and the legal footer only when the author did not place
 * an unsubscribe link already.
 */
export function htmlLayout(document: string, preheader: string | null, company: Company) {
  let html = /<html[\s>]/i.test(document)
    ? document
    : `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head><body>${document}</body></html>`

  if (!/\{\{\s*unsubscribe_url\s*\}\}/.test(html)) {
    const footer = `<style>.footer{padding:24px 12px;text-align:center;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#8a8f98}.footer a{color:#8a8f98}.footer p{margin:0 0 8px}</style>${footerBlock(company)}`
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${footer}</body>`) : html + footer
  }

  const preheaderHtml = preheaderBlock(preheader)
  if (preheaderHtml) {
    html = /<body[^>]*>/i.test(html)
      ? html.replace(/<body[^>]*>/i, (tag) => `${tag}${preheaderHtml}`)
      : preheaderHtml + html
  }

  return html
}
