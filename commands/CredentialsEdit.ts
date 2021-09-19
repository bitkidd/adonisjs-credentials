/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import fs, { promises as fsp } from 'fs'
import { spawn } from 'child_process'
import { BaseCommand, flags } from '@adonisjs/core/build/standalone'
import { Vault } from '../src/Vault'

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

    if (!fs.existsSync(`${credentialsPath}/${env}.key`)) {
      this.logger.error(`Credentials key file for '${env}' environment does not exist`)
      return
    }

    if (!fs.existsSync(`${credentialsPath}/${env}.credentials`)) {
      this.logger.error(`Credentials file for '${env}' environment does not exist`)
      return
    }

    const tmpFileName = this.application.helpers.string.generateRandom(16)
    const tmpFilePath = this.application.tmpPath(`${tmpFileName}.json`)
    const key = await fsp.readFile(`${credentialsPath}/${env}.key`)
    const content = await fsp.readFile(`${credentialsPath}/${env}.credentials`)
    const decryptedContent = Vault.decrypt(content.toString('utf-8'), key.toString('utf-8'))

    if (!fs.existsSync(tmpFilePath)) {
      await fsp.mkdir(this.application.tmpPath(), { recursive: true })
    }

    await fsp.writeFile(tmpFilePath, decryptedContent, 'utf-8')

    const shell = spawn(editor, [tmpFilePath, ...params], { stdio: 'inherit' })

    shell.on('error', async () => {
      await fsp.unlink(tmpFilePath)

      this.logger.error(`Editor failed to open credentials file for '${env}' environment`)
      await this.exit()
    })

    shell.on('close', async () => {
      const tmpContent = await fsp.readFile(tmpFilePath, 'utf-8')
      const tmpEncryptedContent = Vault.encrypt(tmpContent, key.toString('utf-8'))

      await fsp.writeFile(`${credentialsPath}/${env}.credentials`, tmpEncryptedContent)
      await fsp.unlink(tmpFilePath)

      this.logger.success(`Credentials file for '${env}' environment was successfully updated`)
      await this.exit()
    })
  }
}
