import { ValidateFn } from '@poppinss/validator-lite'

import { E_CREDENTIALS_INVALID } from './errors.js'

export class Validator<Schema extends { [key: string]: ValidateFn<unknown> }> {
  #schema: Schema

  constructor(schema: Schema) {
    this.#schema = schema
  }

  validate({ data }: { data: { [K: string]: string | undefined } }): {
    [K in keyof Schema]: ReturnType<Schema[K]>
  } {
    const help: string[] = []

    const validated = Object.keys(this.#schema).reduce(
      (result, key) => {
        const value = process.env[key] || data[key]

        try {
          result[key] = this.#schema[key](key, value) as any
        } catch (error) {
          const updatedMessage = error.message.replace('environment', 'credentials')
          help.push(`- ${updatedMessage}`)
        }
        return result
      },
      { ...data }
    ) as { [K in keyof Schema]: ReturnType<Schema[K]> }

    if (help.length) {
      const error = new E_CREDENTIALS_INVALID()
      error.help = help.join('\n')

      throw error
    }

    return validated
  }
}
