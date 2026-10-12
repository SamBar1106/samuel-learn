import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveLanguage } from '../src/i18n/constants.js'

test('stored choice wins over the browser language', () => {
  assert.equal(resolveLanguage({ stored: 'en', browserLanguage: 'es-MX' }), 'en')
  assert.equal(resolveLanguage({ stored: 'es', browserLanguage: 'en-US' }), 'es')
})

test('browser language is used when nothing is stored', () => {
  assert.equal(resolveLanguage({ stored: null, browserLanguage: 'en-US' }), 'en')
  assert.equal(resolveLanguage({ stored: null, browserLanguage: 'es-AR' }), 'es')
})

test('spanish is the default when the browser language is neither', () => {
  assert.equal(resolveLanguage({ stored: null, browserLanguage: 'fr-FR' }), 'es')
  assert.equal(resolveLanguage({}), 'es')
})
