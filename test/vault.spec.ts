/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'

import { Vault } from '../src/Vault'

test.group('Vault', () => {
  let encrypted = ''

  test('should through an error when trying to encrypt with no key set', (assert) => {
    assert.throw(
      () => Vault.encrypt('Test Message'),
      'Vault key is not set, please specify it before trying to encrypt'
    )
  })

  test('should pick up key from argument', (assert) => {
    assert.isString(Vault.encrypt('Test Message', 'Test Key'))
  })

  test('should generate a random key', (assert) => {
    assert.isString(Vault.generateKey(32))
  })

  test('should encrypt content', (assert) => {
    encrypted = Vault.encrypt('Test Message', 'Test Key')
    assert.isString(Vault.encrypt('Test Message', 'Test Key'))
  })

  test('should decrypt content', (assert) => {
    assert.equal(Vault.decrypt(encrypted, 'Test Key'), 'Test Message')
  })

  test('should throw an error when trying to decrypt with no key set', (assert) => {
    assert.throw(
      () => Vault.decrypt(encrypted),
      'Vault key is not set, please specify it before trying to decrypt'
    )
  })

  test('should throw an error when wrong key', (assert) => {
    assert.throw(
      () => Vault.decrypt(encrypted, 'Wrong Key'),
      'Vault is unable to decrypt, credentials are wrong or corrupted'
    )
  })

  test('should throw an error when corrupted content', (assert) => {
    assert.throw(
      () => Vault.decrypt('Corrupted Content', 'Test Key'),
      'Vault is unable to decrypt, credentials are wrong or corrupted'
    )
  })
})
