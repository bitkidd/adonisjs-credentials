/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { VaultContract } from '@ioc:Adonis/Addons/Credentials'

export class Vault implements VaultContract {
  private static algorithm = 'aes-256-cbc'
  private static ivLength = 16

  private static prepareKey(data?: string) {
    return createHash('sha256').update(String(data)).digest('base64').substr(0, 32)
  }

  public static generateKey(length = 32) {
    return createHash('sha256').update(randomBytes(length)).digest('base64').substr(0, length)
  }

  public static encrypt(data: string, key?: string): string {
    const iv = randomBytes(this.ivLength)
    const buffer = Buffer.from(data)

    if (!key) {
      throw new Error('Vault key is not set, please specify it before trying to encrypt')
    }

    try {
      const cipher = createCipheriv(this.algorithm, Vault.prepareKey(key), iv)
      const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])

      return result.toString('base64')
    } catch (error) {
      throw new Error(`Vault is unable to encrypt, ${error.message}`)
    }
  }

  public static decrypt(data: string, key?: string): string {
    const buffer = Buffer.from(data, 'base64')
    const iv = buffer.slice(0, this.ivLength)
    const content = buffer.slice(this.ivLength)

    if (!key) {
      throw new Error('Vault key is not set, please specify it before trying to decrypt')
    }

    try {
      const decipher = createDecipheriv(this.algorithm, Vault.prepareKey(key), iv)
      const result = Buffer.concat([decipher.update(content), decipher.final()])

      return result.toString('utf-8')
    } catch (error) {
      throw new Error('Vault is unable to decrypt, credentials are wrong or corrupted')
    }
  }
}
