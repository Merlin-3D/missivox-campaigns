import { test } from '@japa/runner'
import { extractTrackableLinks, rewriteLinks } from '#services/email_links'
import { personalizeEmail, prepareEmail } from '#services/email_renderer'

const company = { companyName: 'Exemple SARL', companyAddress: '1 rue de la Paix\n75002 Paris' }

test.group('Email links', () => {
  test('extracts the distinct web links only', ({ assert }) => {
    const html = `
      <a href="https://shop.test/a?x=1&amp;y=2">A</a>
      <a href='https://shop.test/b'>B</a>
      <a href="https://shop.test/a?x=1&y=2">A again</a>
      <a href="mailto:hello@shop.test">Mail</a>
      <a href="{{ unsubscribe_url }}">Unsubscribe</a>
      <a href="#top">Top</a>`

    assert.deepEqual(extractTrackableLinks(html), [
      'https://shop.test/a?x=1&y=2',
      'https://shop.test/b',
    ])
  })

  test('rewrites web links and keeps the others', ({ assert }) => {
    const html = '<a class="x" href="https://shop.test">Shop</a><a href="mailto:a@b.c">Mail</a>'
    const rewritten = rewriteLinks(html, () => 'https://track.test/1')

    assert.equal(
      rewritten,
      '<a class="x" href="https://track.test/1">Shop</a><a href="mailto:a@b.c">Mail</a>'
    )
  })
})

test.group('Email rendering', () => {
  test('wraps visual content in the layout with the legal footer', ({ assert }) => {
    const prepared = prepareEmail(
      { subject: 'Hi', preheader: 'Read me', editor: 'visual', body: '<p>Bonjour</p>' },
      company
    )

    assert.include(prepared.html, 'Bonjour')
    assert.include(prepared.html, 'Exemple SARL')
    assert.include(prepared.html, '75002 Paris')
    assert.include(prepared.html, '{{ unsubscribe_url }}')
    assert.include(prepared.html, 'Read me')
  })

  test('inlines the CSS for email clients', ({ assert }) => {
    const prepared = prepareEmail(
      { subject: 'Hi', preheader: null, editor: 'visual', body: '<h1>Titre</h1>' },
      company
    )
    assert.match(prepared.html, /<h1 style="[^"]*font-size: 26px/)
  })

  test('adds the footer to hand-written HTML without an unsubscribe link', ({ assert }) => {
    const withLink = prepareEmail(
      {
        subject: 'Hi',
        preheader: null,
        editor: 'html',
        body: '<html><body><a href="{{ unsubscribe_url }}">Bye</a></body></html>',
      },
      company
    )
    const withoutLink = prepareEmail(
      { subject: 'Hi', preheader: null, editor: 'html', body: '<p>Raw</p>' },
      company
    )

    assert.notInclude(withLink.html, 'Se désinscrire')
    assert.include(withoutLink.html, 'Se désinscrire')
  })

  test('personalises, tracks links and opens for a delivery', ({ assert }) => {
    const prepared = prepareEmail(
      {
        subject: '{{ first_name }}, une offre',
        preheader: null,
        editor: 'visual',
        body: '<p>Bonjour {{ first_name }}</p><p><a href="https://shop.test">Shop</a></p>',
      },
      company
    )

    const rendered = personalizeEmail(prepared, {
      data: { first_name: 'Awa' },
      unsubscribeUrl: 'https://app.test/u/tok',
      webVersionUrl: 'https://app.test/m/tok',
      tracking: {
        baseUrl: 'https://app.test',
        token: 'tok',
        opens: true,
        links: new Map([['https://shop.test', 7]]),
      },
    })

    assert.equal(rendered.subject, 'Awa, une offre')
    assert.include(rendered.html, 'Bonjour Awa')
    assert.include(rendered.html, 'href="https://app.test/t/c/tok/7"')
    assert.include(rendered.html, 'src="https://app.test/t/o/tok"')
    assert.include(rendered.html, 'href="https://app.test/u/tok"')
    assert.include(rendered.text, 'Bonjour Awa')
    assert.include(rendered.text, 'https://shop.test')
    assert.notInclude(rendered.text, '/t/c/')
  })

  test('does not track previews', ({ assert }) => {
    const prepared = prepareEmail(
      { subject: 'Hi', preheader: null, editor: 'visual', body: '<a href="https://x.test">X</a>' },
      company
    )
    const rendered = personalizeEmail(prepared, {
      data: {},
      unsubscribeUrl: '#',
      webVersionUrl: '#',
    })

    assert.include(rendered.html, 'href="https://x.test"')
    assert.notInclude(rendered.html, '/t/o/')
  })
})
