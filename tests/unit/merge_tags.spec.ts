import { test } from '@japa/runner'
import { findUnknownTags, renderMergeTags } from '#services/merge_tags'

test.group('Merge tags', () => {
  test('replaces tags with the contact data, escaped for HTML', ({ assert }) => {
    const html = renderMergeTags('<p>Bonjour {{ first_name }} de {{company}}</p>', {
      first_name: 'Zoé',
      company: 'Durand & Fils <SARL>',
    })
    assert.equal(html, '<p>Bonjour Zoé de Durand &amp; Fils &lt;SARL&gt;</p>')
  })

  test('uses the fallback when the value is empty', ({ assert }) => {
    const template = 'Bonjour {{ first_name | "cher client" }}'
    assert.equal(renderMergeTags(template, { first_name: '' }), 'Bonjour cher client')
    assert.equal(renderMergeTags(template, {}), 'Bonjour cher client')
    assert.equal(renderMergeTags(template, { first_name: 'Paul' }), 'Bonjour Paul')
  })

  test('accepts fallbacks whose quotes were HTML-encoded by the editor', ({ assert }) => {
    const template = 'Bonjour {{ first_name | &quot;à vous&quot; }}'
    assert.equal(renderMergeTags(template, {}), 'Bonjour à vous')
  })

  test('never leaves an unknown tag in the output', ({ assert }) => {
    assert.equal(renderMergeTags('A{{ nope }}B', {}), 'AB')
  })

  test('reads custom attributes', ({ assert }) => {
    assert.equal(renderMergeTags('{{ attr.ville }}', { 'attr.ville': 'Douala' }), 'Douala')
  })

  test('can encode values for URLs or leave them raw', ({ assert }) => {
    const data = { email: 'a+b@example.com' }
    assert.equal(
      renderMergeTags('https://x.test/?e={{ email }}', data, { escape: encodeURIComponent }),
      'https://x.test/?e=a%2Bb%40example.com'
    )
    assert.equal(renderMergeTags('{{ email }}', data, { escape: false }), 'a+b@example.com')
  })

  test('lists unknown tags to warn about typos', ({ assert }) => {
    const unknown = findUnknownTags(
      '{{ first_name }} {{ frist_name }} {{ attr.x }} {{ unsubscribe_url }}'
    )
    assert.deepEqual(unknown, ['frist_name'])
  })
})
