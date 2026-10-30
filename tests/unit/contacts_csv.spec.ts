import { test } from '@japa/runner'
import { parseContactsCsv } from '#services/contact_importer'

test.group('Contacts CSV parsing', () => {
  test('reads French headers with semicolons and keeps extra columns as attributes', ({
    assert,
  }) => {
    const csv = [
      '﻿E-mail;Prénom;Nom;Société;Ville',
      ' Camille.Martin@Example.com ;Camille;Martin;Exemple SARL;Lyon',
      'paul@example.com;Paul;;;',
    ].join('\r\n')

    const { rows, invalid } = parseContactsCsv(csv)

    assert.lengthOf(invalid, 0)
    assert.deepEqual(rows[0], {
      line: 2,
      email: 'camille.martin@example.com',
      firstName: 'Camille',
      lastName: 'Martin',
      company: 'Exemple SARL',
      phone: null,
      attributes: { Ville: 'Lyon' },
    })
    assert.equal(rows[1].email, 'paul@example.com')
    assert.isNull(rows[1].lastName)
    assert.deepEqual(rows[1].attributes, {})
  })

  test('reads English headers with commas', ({ assert }) => {
    const { rows } = parseContactsCsv('email,first_name,last_name,phone\na@b.co,Ann,Lee,123')
    assert.equal(rows[0].firstName, 'Ann')
    assert.equal(rows[0].phone, '123')
  })

  test('reports invalid emails with their line number', ({ assert }) => {
    const { rows, invalid } = parseContactsCsv('email\nok@example.com\nnot-an-email\n;')
    assert.lengthOf(rows, 1)
    assert.deepEqual(invalid[0], {
      line: 3,
      value: 'not-an-email',
      reason: 'Adresse email invalide',
    })
  })

  test('refuses a file without an email column', ({ assert }) => {
    assert.throws(() => parseContactsCsv('name,phone\nAnn,123'), /colonne « email »/)
  })
})
