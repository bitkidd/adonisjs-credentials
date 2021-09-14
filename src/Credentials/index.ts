/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs'
import { join } from 'path'
import { Exception } from '@poppinss/utils'
import { CredentialsContract } from '@ioc:Adonis/Addons/Credentials'
import { Vault } from '../Vault'

export class Credentials implements CredentialsContract {
  private env = process.env.NODE_ENV || 'development'
  private credentialsPath = join('resources', 'credentials')
  private content: string = ''
  private credentials: Object = {}

  constructor(args?: { env?: string; credentialsPath?: string }) {
    this.env = args?.env || this.env
    this.credentialsPath = args?.credentialsPath || this.credentialsPath

    if (
      !fs.existsSync(`${this.credentialsPath}/${this.env}.key`) ||
      process.env.ADONIS_CREDENTIALS_KEY
    ) {
      throw new Exception(
        `Credentials key file for '${this.env}' environment does not exist`,
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
    const key = fs.readFileSync(`${this.credentialsPath}/${this.env}.key`)
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
        this.credentials[newKey.toUpperCase()] = value
      }
    }
  }

  private populate() {
    for (let key in this.credentials) {
      process.env[key] = this.credentials[key]
    }
  }

  public initialize(): void {
    this.read()
    this.validate()
    this.parse()
    this.populate()
  }
}
