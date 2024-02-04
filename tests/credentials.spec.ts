import { test } from '@japa/runner'

import { Credentials } from '../src/credentials.js'
import { Validator } from '../src/validator.js'

test.group('Credentials', async () => {
  test('should return credentials data by key', async ({ assert, fs }) => {
    await fs.create('development.key', 'v2.OlNJCYbOfpYulomvTEeTun4rp5WXz3yI')
    await fs.create(
      'development.credentials',
      'v2.FFknPJtcl+V2kJj6eio3I1GYL2bRKfw9iQ8Ot4O12qeUqf6Bv0A5uHDB7UZ6KDioVMM6B0DY2HaKqpea5g8meQ=='
    )

    const credentials = await Credentials.create(
      {
        HELLO_FROM: Credentials.schema.string(),
      },
      { path: fs.basePath }
    )
    const key = credentials.get('HELLO_FROM')

    assert.equal(key, 'adonisjs')
  })

  test('should return default value for unknown key', async ({ assert, fs }) => {
    await fs.create('development.key', 'v2.OlNJCYbOfpYulomvTEeTun4rp5WXz3yI')
    await fs.create(
      'development.credentials',
      'v2.FFknPJtcl+V2kJj6eio3I1GYL2bRKfw9iQ8Ot4O12qeUqf6Bv0A5uHDB7UZ6KDioVMM6B0DY2HaKqpea5g8meQ=='
    )

    const credentials = await Credentials.create(
      {
        HELLO_FROM: Credentials.schema.string(),
      },
      { path: fs.basePath }
    )
    const key = credentials.get('HELLO_UNKNOW', 'Hello Unknown')

    assert.equal(key, 'Hello Unknown')
  })

  test('should return null for unknown key without default value', async ({ assert, fs }) => {
    await fs.create('development.key', 'v2.OlNJCYbOfpYulomvTEeTun4rp5WXz3yI')
    await fs.create(
      'development.credentials',
      'v2.FFknPJtcl+V2kJj6eio3I1GYL2bRKfw9iQ8Ot4O12qeUqf6Bv0A5uHDB7UZ6KDioVMM6B0DY2HaKqpea5g8meQ=='
    )

    const credentials = await Credentials.create(
      {
        HELLO_FROM: Credentials.schema.string(),
      },
      { path: fs.basePath }
    )
    const key = credentials.get('HELLO_UNKNOW')

    assert.equal(key, null)
  })

  test('should return validator rules', async ({ assert }) => {
    const credentials = Credentials.rules({
      HELLO_FROM: Credentials.schema.string(),
    })

    assert.instanceOf(credentials, Validator)
  })
})
