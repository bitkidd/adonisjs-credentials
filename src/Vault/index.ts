/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { Exception } from '@poppinss/utils'
import { VaultContract } from '@ioc:Adonis/Addons/Credentials'

export class Vault implements VaultContract {
  private static algorithm = 'aes-256-cbc'
  private static ivLength = 16
  private static keyParam = 'ADONIS_CREDENTIALS_KEY'

  private static prepareKey(data?: string) {
    return createHash('sha256').update(String(data)).digest('base64').substr(0, 32)
  }

  public static generateKey(length = 32) {
    return createHash('sha256').update(randomBytes(length)).digest('base64').substr(0, length)
  }

  public static encrypt(data: string, key?: string): string {
    if (key || process.env[this.keyParam]) {
      const iv = randomBytes(this.ivLength)
      const buffer = Buffer.from(data)

      try {
        const cipher = createCipheriv(this.algorithm, Vault.prepareKey(key), iv)
        const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()])

        return result.toString('base64')
      } catch (error) {
        throw new Exception(
          `Credentials cannot be encrypted, ${error.message}`,
          500,
          'E_CREDENTIALS_ENCRYPT'
        )
      }
    } else {
      throw new Exception(
        'Credentials key is not set, please specify it in ADONIS_CREDENTIALS_KEY environment variable',
        500,
        'E_CREDENTIALS_KEY_NOT_SET'
      )
    }
  }

  public static decrypt(data: string, key?: string): string {
    if (key || process.env[this.keyParam]) {
      const buffer = Buffer.from(data, 'base64')
      const iv = buffer.slice(0, this.ivLength)
      const content = buffer.slice(this.ivLength)

      try {
        const decipher = createDecipheriv(this.algorithm, Vault.prepareKey(key), iv)
        const result = Buffer.concat([decipher.update(content), decipher.final()])

        return result.toString('utf-8')
      } catch (error) {
        throw new Exception(
          'Credentials are wrong or corrupted, unable to decrypt',
          500,
          'E_CREDENTIALS_DECRYPT'
        )
      }
    } else {
      throw new Exception(
        'Credentials key is not set, please specify it in ADONIS_CREDENTIALS_KEY environment variable',
        500,
        'E_CREDENTIALS_KEY_NOT_SET'
      )
    }
  }
}
