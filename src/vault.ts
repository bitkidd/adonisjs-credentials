import type { VaultConfig } from '../types/config.js'

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import {
  E_CREDENTIALS_CANNOT_DECRYPT,
  E_CREDENTIALS_MISSING_KEY,
  E_CREDENTIALS_UNKNOWN_VERSION,
} from './errors.js'
import { FileSystem } from './filesystem.js'

export class Vault {
  #version = 'v2'
  #ivLength = 16
  #algorithm = 'aes-256-cbc'
  #filesystem = new FileSystem()

  #config = {
    path: 'resources/credentials',
    environment: 'development',
  }

  constructor(config?: VaultConfig) {
    this.#config = { ...this.#config, ...config }
  }

  #checkVersion({ data }: { data: string }) {
    const [version, content] = data.replace(/\s/g, '').split('.')

    if (version !== this.#version) {
      throw new E_CREDENTIALS_UNKNOWN_VERSION()
    }

    return content
  }

  get version() {
    return this.#version
  }

  async getKey() {
    try {
      const key = await this.#filesystem.read({
        path: `${this.#config.path}/${this.#config.environment}.key`,
      })

      return key
    } catch (error) {
      if (process.env.APP_CREDENTIALS_KEY) {
        return process.env.APP_CREDENTIALS_KEY
      }

      throw new E_CREDENTIALS_MISSING_KEY()
    }
  }

  prepareKey({ data }: { data: string }) {
    return createHash('sha256').update(String(data)).digest('base64').slice(0, 32)
  }

  generateKey({ length = 32 }: { length: number }) {
    const keyBase = createHash('sha256')
      .update(randomBytes(length))
      .digest('base64')
      .slice(0, length)

    return `${this.#version}.${keyBase}`
  }

  encrypt({ data, key }: { data: string; key: string }): string {
    if (!key.length) {
      throw new E_CREDENTIALS_MISSING_KEY()
    }

    const plainKey = this.#checkVersion({ data: key })
    const iv = randomBytes(this.#ivLength)
    const buffer = Buffer.from(data)

    const cipher = createCipheriv(this.#algorithm, this.prepareKey({ data: plainKey }), iv)
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])

    return `${this.#version}.${result.toString('base64')}`
  }

  decrypt({ data, key }: { data: string; key: string }): string {
    if (!key.length) {
      throw new E_CREDENTIALS_MISSING_KEY()
    }

    const plainKey = this.#checkVersion({ data: key })
    const plainData = this.#checkVersion({ data })

    const buffer = Buffer.from(plainData, 'base64')
    const iv = buffer.subarray(0, this.#ivLength)
    const content = buffer.subarray(this.#ivLength)

    try {
      const decipher = createDecipheriv(this.#algorithm, this.prepareKey({ data: plainKey }), iv)
      const result = Buffer.concat([decipher.update(content), decipher.final()])

      return result.toString('utf-8')
    } catch (error) {
      throw new E_CREDENTIALS_CANNOT_DECRYPT()
    }
  }
}
