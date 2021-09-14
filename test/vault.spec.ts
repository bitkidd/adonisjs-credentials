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

  test('should through an error without key set', (assert) => {
    assert.throw(
      () => Vault.encrypt('Test Message'),
      'E_CREDENTIALS_KEY_NOT_SET: Credentials key is not set, please specify it in ADONIS_CREDENTIALS_KEY environment variable'
    )
  })

  test('should pick up key from environment', (assert) => {
    process.env.ADONIS_CREDENTIALS_KEY = 'Test Key'
    assert.isString(Vault.encrypt('Test Message'))
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

  test('should throw an error when wrong key', (assert) => {
    assert.throw(
      () => Vault.decrypt(encrypted, 'Wrong Key'),
      'E_CREDENTIALS_DECRYPT: Credentials are wrong or corrupted, unable to decrypt'
    )
  })

  test('should throw an error when corrupted content', (assert) => {
    assert.throw(
      () => Vault.decrypt('Corrupted Content', 'Test Key'),
      'E_CREDENTIALS_DECRYPT: Credentials are wrong or corrupted, unable to decrypt'
    )
  })
})
