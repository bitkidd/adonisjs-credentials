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
import { join } from 'path'
import { Exception } from '@poppinss/utils'
import { string } from '@poppinss/utils/build/helpers'
import { CredentialsContract } from '@ioc:Adonis/Addons/Credentials'
import { Vault } from '../Vault'

export class Credentials implements CredentialsContract {
  private env = 'development'
  private key: string | null = null
  private keyParam = 'APP_CREDENTIALS_KEY'
  private credentialsPath = join('resources', 'credentials')
  private content: string = ''
  private credentials: Object = {}

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
    this.key = args?.key || process.env[this.keyParam] || this.key
    this.credentialsPath = args?.credentialsPath || this.credentialsPath
  }

  private check() {
    if (!this.key && !fs.existsSync(`${this.credentialsPath}/${this.env}.key`)) {
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
    const key = this.key || fs.readFileSync(`${this.credentialsPath}/${this.env}.key`)
    const content = fs.readFileSync(`${this.credentialsPath}/${this.env}.credentials`)
    const decryptedContent = Vault.decrypt(content.toString('utf-8'), key.toString('utf-8'))
    this.content = decryptedContent
  }

  private validate() {
    try {
      JSON.parse(this.content)
    } catch (error) {
      throw new Exception(
        `Credentials file for '${this.env}' environment is corrupted, should be a valid JSON`,
        500,
        'E_CREDENTIALS_WRONG_FORMAT'
      )
    }
  }

  private parse(obj?: Object, current?: string) {
    const object = obj || JSON.parse(this.content)
    for (var key in object) {
      const value = object[key]
      const newKey = current ? current + '_' + key : key
      if (value && typeof value === 'object') {
        this.parse(value, newKey)
      } else {
        this.credentials[string.snakeCase(newKey).toUpperCase()] = value
      }
    }
  }

  private populate() {
    for (let key in this.credentials) {
      process.env[key] = this.credentials[key]
    }
  }

  public initialize(): void {
    this.check()
    this.read()
    this.validate()
    this.parse()
    this.populate()
  }
}
