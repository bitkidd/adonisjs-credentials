/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import execa from 'execa'
import fs, { promises as fsp } from 'fs'
import { BaseCommand, flags } from '@adonisjs/core/build/standalone'
import { Vault } from '../src/Vault'
import { Credentials } from '../src/Credentials'

export default class CredentialsEdit extends BaseCommand {
  public static commandName = 'credentials:edit'
  public static description = 'Edit a credentials file'
  public static settings = {
    loadApp: false,
    stayAlive: true,
  }

  @flags.string({
    description: 'Specify an environment for credentials file (default: development)',
  })
  public env: string

  @flags.string({
    description: 'Specify an editor to use for edit',
  })
  public editor: string

  public async run(): Promise<void> {
    const env = this.env || process.env.NODE_ENV || 'development'
    const [editor, ...params] = this.editor?.split(' ') || process.env.EDITOR?.split(' ') || 'nano'
    const credentialsPath = this.application.resourcesPath('credentials')

    const credentials = new Credentials({ env, credentialsPath })
    const content = credentials.content()
    const format = credentials.format()
    const key = credentials.key()

    const tmpFileName = this.application.helpers.string.generateRandom(16)
    const tmpFilePath = this.application.tmpPath(`${tmpFileName}.${format}`)

    if (!fs.existsSync(tmpFilePath)) {
      await fsp.mkdir(this.application.tmpPath(), { recursive: true })
    }

    await fsp.writeFile(tmpFilePath, content, 'utf-8')

    try {
      await execa(editor, [tmpFilePath, ...params], { stdio: 'inherit' })

      const tmpContent = await fsp.readFile(tmpFilePath, 'utf-8')
      const tmpEncryptedContent = Vault.encrypt(tmpContent, key || '')

      await fsp.writeFile(`${credentialsPath}/${env}.credentials`, tmpEncryptedContent)
      await fsp.unlink(tmpFilePath)

      this.logger.success(`Credentials file for '${env}' environment was successfully updated`)
      await this.exit()
    } catch (error) {
      console.log(error)

      await fsp.unlink(tmpFilePath)

      this.logger.error(`Editor failed to open credentials file for '${env}' environment`)
      await this.exit()
    }
  }
}
