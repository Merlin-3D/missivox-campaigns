/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * HTML forms send empty fields as empty strings: they are treated as
 * missing values.
 */
vine.convertEmptyStringsToNull = true

/**
 * Validation messages, in French.
 */
vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Ce champ est obligatoire.',
  'string': 'Ce champ doit être un texte.',
  'email': 'Saisissez une adresse email valide.',
  'minLength': 'Saisissez au moins {{ min }} caractères.',
  'maxLength': 'Saisissez au plus {{ max }} caractères.',
  'number': 'Saisissez un nombre.',
  'min': 'La valeur doit être supérieure ou égale à {{ min }}.',
  'max': 'La valeur doit être inférieure ou égale à {{ max }}.',
  'withoutDecimals': 'Saisissez un nombre entier.',
  'enum': 'Choisissez une valeur parmi : {{ choices }}.',
  'boolean': 'La valeur doit être oui ou non.',
  'date': 'Saisissez une date valide.',
  'array': 'La valeur doit être une liste.',
  'array.minLength': 'Choisissez au moins {{ min }} élément(s).',
  'sameAs': 'Les deux valeurs ne correspondent pas.',
  'database.unique': 'Cette valeur est déjà utilisée.',
  'database.exists': "Cet élément n'existe pas.",
  'file': 'Choisissez un fichier.',
  'file.size': 'Le fichier ne doit pas dépasser {{ size }}.',
  'file.extname': 'Formats acceptés : {{ extnames }}.',
})
