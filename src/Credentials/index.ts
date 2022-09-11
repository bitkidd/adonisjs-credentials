/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs'
import dotenv from 'dotenv'
import YAML from 'yaml'
import { join } from 'path'
import { Exception } from '@poppinss/utils'
import { string } from '@poppinss/utils/build/helpers'
import { CredentialsContract } from '@ioc:Adonis/Addons/Credentials'
import { Vault } from '../Vault'

export class Credentials implements CredentialsContract {
  private initialized = false
  private env = 'development'
  private keyValue: string | null = null
  private keyParam = 'APP_CREDENTIALS_KEY'
  private credentialsFormat: 'yaml' | 'json' = 'yaml'
  private credentialsPath = join('resources', 'credentials')
  private credentialsContent: string = ''
  private credentialsValues: Record<string, string | boolean | number> = {}

  constructor(args?: {
    env?: string
    key?: string
    dotenvPath?: string
    credentialsPath?: string
  }) {
    if (!process.env.ENV_SILENT) {
      dotenv.config({ path: args?.dotenvPath || join(process.cwd(), '.env') })
    }

    this.env = args?.env || process.env.NODE_ENV || this.env
    this.keyValue = args?.key || process.env[this.keyParam] || this.keyValue
    this.credentialsPath = args?.credentialsPath || this.credentialsPath
  }

  private check() {
    if (!this.keyValue && !fs.existsSync(`${this.credentialsPath}/${this.env}.key`)) {
      throw new Exception(
        `Credentials key for '${this.env}' environment does not exist, please set it in a file or in ${this.keyParam} environment variable`,
        500,
        'E_CREDENTIALS_NO_KEY'
      )
    }

    if (!fs.existsSync(`${this.credentialsPath}/${this.env}.credentials`)) {
      throw new Exception(
        `Credentials file for '${this.env}' environment does not exist`,
        500,
        'E_CREDENTIALS_NO_FILE'
      )
    }
  }

  private read() {
    const key = this.keyValue || fs.readFileSync(`${this.credentialsPath}/${this.env}.key`)
    const content = fs.readFileSync(`${this.credentialsPath}/${this.env}.credentials`)
    const decryptedContent = Vault.decrypt(content.toString('utf-8'), key.toString('utf-8'))

    this.keyValue = key.toString('utf-8')
    this.credentialsContent = decryptedContent
  }

  private validate() {
    try {
      JSON.parse(this.credentialsContent)
      this.credentialsFormat = 'json'
    } catch {
      try {
        YAML.parse(this.credentialsContent)
        this.credentialsFormat = 'yaml'
      } catch {
        throw new Exception(
          `Credentials file for '${this.env}' environment is corrupted, should be a valid YAML or JSON`,
          500,
          'E_CREDENTIALS_WRONG_FORMAT'
        )
      }
    }
  }

  private parse(obj?: Record<string, any>, current?: string) {
    let object = obj

    if (!object && this.credentialsFormat === 'json') {
      object = JSON.parse(this.credentialsContent)
    }

    if (!object && this.credentialsFormat === 'yaml') {
      object = YAML.parse(this.credentialsContent)
    }

    for (const key in object) {
      const value = object[key]
      const newKey = current ? current + '_' + key : key
      if (value && typeof value === 'object') {
        this.parse(value, newKey)
      } else {
        this.credentialsValues[string.snakeCase(newKey).toUpperCase()] = value
      }
    }
  }

  private populate() {
    for (let key in this.credentialsValues) {
      process.env[key] = `${this.credentialsValues[key]}`
    }
  }

  public key(): string | null {
    if (!this.initialized) {
      this.initialize()
    }

    return this.keyValue
  }

  public content(): string {
    if (!this.initialized) {
      this.initialize()
    }

    return this.credentialsContent
  }

  public format(): string {
    if (!this.initialized) {
      this.initialize()
    }

    return this.credentialsFormat
  }

  public get(key?: string): string | boolean | number | Record<string, string | boolean | number> {
    if (!this.initialized) {
      this.initialize()
    }

    if (key) {
      return this.credentialsValues[key]
    } else {
      return this.credentialsValues
    }
  }

  public initialize(): void {
    this.check()
    this.read()
    this.validate()
    this.parse()
    this.populate()

    this.initialized = true
  }
}
