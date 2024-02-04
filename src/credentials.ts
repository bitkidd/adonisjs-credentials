import type { ValidateFn } from '@poppinss/validator-lite'
import type { CredentialsConfig } from '../types/config.js'

import { schema as credentialsSchema } from '@poppinss/validator-lite'

import { Vault } from './vault.js'
import { Parser } from './parser.js'
import { FileSystem } from './filesystem.js'
import { Validator } from './validator.js'

export class Credentials<CredentialValues extends Record<string, any>> {
  static #config: CredentialsConfig = {
    path: 'resources/credentials',
    environment: process.env.NODE_ENV || 'development',
    populateEnvironment: false,
  }
  #values: CredentialValues

  constructor(values: CredentialValues) {
    this.#values = values
  }

  static schema = credentialsSchema

  static rules<T extends { [key: string]: ValidateFn<unknown> }>(schema: T): Validator<T> {
    const validator = new Validator<T>(schema)
    return validator
  }

  static async create<Schema extends { [key: string]: ValidateFn<unknown> }>(
    schema: Schema,
    config?: CredentialsConfig
  ): Promise<
    Credentials<{
      [K in keyof Schema]: ReturnType<Schema[K]>
    }>
  > {
    this.#config = { ...this.#config, ...config }

    const vault = new Vault(this.#config)
    const parser = new Parser()
    const filesystem = new FileSystem()
    const validator = new Validator<Schema>(schema)

    const key = await vault.getKey()
    const content = await filesystem.read({
      path: `${this.#config.path}/${this.#config.environment}.credentials`,
    })
    const decryptedContent = vault.decrypt({ data: content, key })
    const { data: parsedContent } = parser.parse({ data: decryptedContent })
    const validatedContent = validator.validate({
      data: parsedContent,
    })

    const credentials = new Credentials(validatedContent)

    return credentials
  }

  get<K extends keyof CredentialValues>(key: K): CredentialValues[K]
  get<K extends keyof CredentialValues>(
    key: K,
    defaultValue: Exclude<CredentialValues[K], undefined>
  ): Exclude<CredentialValues[K], undefined>
  get(key: string): string | undefined
  get(key: string, defaultValue: string): string
  get(key: string, defaultValue?: any): any {
    return this.#values[key] ?? defaultValue ?? null
  }
}
