import juice from 'juice'
import { convert } from 'html-to-text'
import type { Editor } from '#database/enums'
import { rewriteLinks } from '#services/email_links'
import { htmlLayout, visualLayout } from '#services/email_layout'
import { renderMergeTags, type MergeData } from '#services/merge_tags'
import type { AppSettings } from '#services/settings_service'

export type EmailContent = {
  subject: string
  preheader: string | null
  editor: Editor
  body: string
}

/**
 * An email ready to be personalised: the layout is applied and the CSS
 * inlined, but the merge tags are still in place. Preparing is the costly
 * part, so it is done once per campaign.
 */
export type PreparedEmail = {
  subject: string
  html: string
}

export type PersonalizeOptions = {
  data: MergeData
  unsubscribeUrl: string
  webVersionUrl: string
  /**
   * Tracking is only applied to real deliveries, never to previews and
   * test emails.
   */
  tracking?: {
    baseUrl: string
    token: string
    opens: boolean
    /**
     * Maps each tracked URL (as written in the template) to its link id.
     */
    links: Map<string, number> | null
  }
}

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

export function prepareEmail(
  content: EmailContent,
  company: Pick<AppSettings, 'companyName' | 'companyAddress'>
): PreparedEmail {
  const document =
    content.editor === 'visual'
      ? visualLayout(content.body, content.preheader, company)
      : htmlLayout(content.body, content.preheader, company)

  return {
    subject: content.subject,
    html: juice(document, { preserveImportant: true }),
  }
}

export function personalizeEmail(email: PreparedEmail, options: PersonalizeOptions): RenderedEmail {
  const data: MergeData = {
    ...options.data,
    unsubscribe_url: options.unsubscribeUrl,
    web_version_url: options.webVersionUrl,
  }

  let template = email.html
  const tracking = options.tracking

  if (tracking?.links) {
    const links = tracking.links
    template = rewriteLinks(template, (url) => {
      const linkId = links.get(url)
      return linkId ? `${tracking.baseUrl}/t/c/${tracking.token}/${linkId}` : null
    })
  }

  let html = renderMergeTags(template, data)
  if (tracking?.opens) {
    const pixel = `<img src="${tracking.baseUrl}/t/o/${tracking.token}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;">`
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${pixel}</body>`) : html + pixel
  }

  const text = convert(renderMergeTags(email.html, data), {
    wordwrap: 80,
    selectors: [
      { selector: '.preheader', format: 'skip' },
      { selector: 'img', format: 'skip' },
      { selector: 'style', format: 'skip' },
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'h1', options: { uppercase: false } },
      { selector: 'h2', options: { uppercase: false } },
      { selector: 'h3', options: { uppercase: false } },
    ],
  })

  return {
    subject: renderMergeTags(email.subject, data, { escape: false }),
    html,
    text,
  }
}
