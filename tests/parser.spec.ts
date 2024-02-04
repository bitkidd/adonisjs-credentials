import { test } from '@japa/runner'

import { Parser } from '../src/parser.js'
import { E_CREDENTIALS_INVALID_FORMAT } from '../src/errors.js'

test.group('Parser', () => {
  const parser = new Parser()

  test('should recogize yaml format', async ({ assert }) => {
    const yaml = `
      hello: world
      portugal:
        capital: Lisbon
    `

    const { format } = parser.parse({ data: yaml })

    assert.equal(format, 'yaml')
  })

  test('should recogize json format', async ({ assert }) => {
    const json = `{ "hello": "world", "portugal": { "capital": "Lisbon" } }`

    const { format } = parser.parse({ data: json })

    assert.equal(format, 'json')
  })

  test('should parse yaml format', async ({ assert }) => {
    const yaml = `
      hello: world
      portugal:
        capital: Lisbon
        food:
          desert: Pastel de nata

    `

    const { data } = parser.parse({ data: yaml })

    assert.deepEqual(data, {
      HELLO: 'world',
      PORTUGAL_CAPITAL: 'Lisbon',
      PORTUGAL_FOOD_DESERT: 'Pastel de nata',
    })
  })

  test('should parse json format', async ({ assert }) => {
    const json = `{ "hello": "world", "portugal": { "capital": "Lisbon", "food": { "desert": "Pastel de nata" } } }`

    const { data } = parser.parse({ data: json })

    assert.deepEqual(data, {
      HELLO: 'world',
      PORTUGAL_CAPITAL: 'Lisbon',
      PORTUGAL_FOOD_DESERT: 'Pastel de nata',
    })
  })

  test('should fail to parse corrupted file', async ({ assert }) => {
    const json = `{ "hello": "world }`

    try {
      parser.parse({ data: json })
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_INVALID_FORMAT)
    }
  })
})
