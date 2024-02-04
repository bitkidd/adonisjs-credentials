import { test } from '@japa/runner'

import { schema } from '@poppinss/validator-lite'

import { Validator } from '../src/validator.js'
import { E_CREDENTIALS_INVALID } from '../src/errors.js'

test.group('Validator', () => {
  test('should validate and return data', async ({ assert }) => {
    const data = {
      HELLO: 'world',
      PORTUGAL_CAPITAL: 'Lisbon',
      PORTUGAL_FOOD_DESERT: 'Pastel de nata',
    }
    const validator = new Validator({
      HELLO: schema.string(),
      PORTUGAL_CAPITAL: schema.string(),
      PORTUGAL_FOOD_DESERT: schema.string(),
    })

    const validatedData = validator.validate({
      data,
    })

    assert.deepEqual(validatedData, {
      HELLO: 'world',
      PORTUGAL_CAPITAL: 'Lisbon',
      PORTUGAL_FOOD_DESERT: 'Pastel de nata',
    })
  })

  test('should throu an error when unable to validate', async ({ assert }) => {
    const data = {
      HELLO: 'world',
      PORTUGAL_CAPITAL: 'Lisbon',
    }
    const validator = new Validator({
      HELLO: schema.string(),
      PORTUGAL_CAPITAL: schema.string(),
      PORTUGAL_CAPITAL_DESERT: schema.string(),
    })

    try {
      validator.validate({
        data,
      })
    } catch (error) {
      assert.instanceOf(error, E_CREDENTIALS_INVALID)
      assert.deepEqual(error.help.split('\n'), [
        '- Missing credentials variable "PORTUGAL_CAPITAL_DESERT"',
      ])
    }
  })
})
