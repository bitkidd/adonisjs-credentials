import { test } from '@japa/runner'

import { Vault } from '../src/vault.js'
import {
  E_CREDENTIALS_CANNOT_DECRYPT,
  E_CREDENTIALS_MISSING_KEY,
  E_CREDENTIALS_UNKNOWN_VERSION,
} from '../src/errors.js'

test.group('Vault', () => {
  const vault = new Vault()
  let encrypted = `${vault.version}.`

  test('should through an error when no key defined anywhere', async ({ assert }) => {
    try {
      await vault.getKey()
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_MISSING_KEY)
    }
  })

  test('should return a key defined in file', async ({ assert, fs }) => {
    delete process.env.APP_CREDENTIALS_KEY
    await fs.create('development.key', 'Test Key')

    const vaultWithPath = new Vault({ path: fs.basePath })
    const key = await vaultWithPath.getKey()

    assert.equal(key, 'Test Key')
  })

  test('should return a key defined in a process', async ({ assert }) => {
    process.env.APP_CREDENTIALS_KEY = 'Test Key'

    const key = await vault.getKey()

    assert.equal(key, 'Test Key')
  })

  test('should generate a random key', ({ assert }) => {
    assert.isString(vault.generateKey({ length: 32 }))
  })

  test('should through an error when trying to encrypt with no key set', ({ assert }) => {
    try {
      vault.encrypt({ data: 'testcontent', key: '' })
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_MISSING_KEY)
    }
  })

  test('should pick up key from argument', ({ assert }) => {
    assert.isString(vault.encrypt({ data: 'v2.testcontent', key: 'v2.testkey' }))
  })

  test('should encrypt content', ({ assert }) => {
    encrypted = vault.encrypt({ data: 'v2.testcontent', key: 'v2.testkey' })
    assert.isString(vault.encrypt({ data: 'v2.testcontent', key: 'v2.testkey' }))
  })

  test('should decrypt content', ({ assert }) => {
    assert.equal(vault.decrypt({ data: encrypted, key: 'v2.testkey' }), 'v2.testcontent')
  })

  test('should throw an error when trying to decrypt with no key set', ({ assert }) => {
    try {
      vault.decrypt({ data: encrypted, key: '' })
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_MISSING_KEY)
    }
  })

  test('should throw an error when wrong key', ({ assert }) => {
    try {
      vault.decrypt({ data: encrypted, key: 'v2.wrongkey' })
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_CANNOT_DECRYPT)
    }
  })

  test('should throw an error when corrupted content', ({ assert }) => {
    try {
      vault.decrypt({ data: 'v2.corruptedcontent', key: 'v2.testkey' })
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_CANNOT_DECRYPT)
    }
  })

  test('should throw an error when no version found with key or credentials', async ({
    assert,
  }) => {
    try {
      vault.decrypt({
        data: 'v2.FFknPJtcl+V2kJj6eio3I1GYL2bRKfw9iQ8Ot4O12qeUqf6Bv0A5uHDB7UZ6KDioVMM6B0DY2HaKqpea5g8meQ==',
        key: 'OlNJCYbOfpYulomvTEeTun4rp5WXz3yI',
      })
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_UNKNOWN_VERSION)
    }
  })

  test('should throw an error when versions do not correspond', async ({ assert }) => {
    try {
      vault.decrypt({
        data: 'v2.FFknPJtcl+V2kJj6eio3I1GYL2bRKfw9iQ8Ot4O12qeUqf6Bv0A5uHDB7UZ6KDioVMM6B0DY2HaKqpea5g8meQ==',
        key: 'v3.OlNJCYbOfpYulomvTEeTun4rp5WXz3yI',
      })
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_UNKNOWN_VERSION)
    }
  })
})
