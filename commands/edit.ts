/*
 * @bitkidd/adonisjs-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'dotenv/config'
import { execa } from 'execa'
import { flags, BaseCommand } from '@adonisjs/core/ace'
import string from '@adonisjs/core/helpers/string'

import { Vault } from '../src/vault.js'
import { Parser } from '../src/parser.js'
import { FileSystem } from '../src/filesystem.js'

export default class CredentialsEdit extends BaseCommand {
  static commandName = 'credentials:edit'
  static description = 'Edit a credentials file'

  @flags.string({
    description: 'Specify an environment for credentials file (default: development)',
  })
  declare env: string

  @flags.string({
    description: 'Specify an editor to use for edit',
  })
  declare editor: string

  #vault = new Vault()
  #parser = new Parser()
  #filesystem = new FileSystem()

  async run() {
    if (!this.editor && !process.env.EDITOR) {
      this.logger.error(
        'Credentials editor is unset, please set it in EDITOR environment variable or pass it as a flag'
      )
      return
    }

    const env = this.env || process.env.NODE_ENV || 'development'
    const [editor, ...params] = this.editor?.split(' ') || process.env.EDITOR?.split(' ')
    const credentialsPath = this.app.makePath('resources/credentials')

    const keyData = await this.#filesystem.read({ path: `${credentialsPath}/${env}.key` })
    const credentialsData = await this.#filesystem.read({
      path: `${credentialsPath}/${env}.credentials`,
    })
    const credentialsDataDecrypted = this.#vault.decrypt({ data: credentialsData, key: keyData })
    const { format } = this.#parser.parse({
      data: credentialsDataDecrypted,
    })

    const randomUid = string.generateRandom(16)
    const tmpFilePath = this.app.tmpPath(`${randomUid}.${format}`)

    await this.#filesystem.write({ data: credentialsDataDecrypted, path: tmpFilePath })
    this.logger.success(`Decrypted credentials file for '${env}'`)

    if (this.editor === 'none') {
      this.logger.info(
        `Command was terminated because editor is set to 'none'. Do not forget to remove the temporary file.`
      )
      this.terminate()
      return
    }
    /* c8 ignore start */
    try {
      await execa(editor, [tmpFilePath, ...params], {
        stdio: 'inherit',
      })

      const updatedCredentialsData = await this.#filesystem.read({ path: tmpFilePath })
      const updatedCredentialsDataEncrypted = this.#vault.encrypt({
        data: updatedCredentialsData,
        key: keyData,
      })

      await this.#filesystem.write({
        data: updatedCredentialsDataEncrypted,
        path: `${credentialsPath}/${env}.credentials`,
      })
      await this.#filesystem.erase({ path: tmpFilePath })

      this.logger.success(`Credentials file for '${env}' environment was successfully updated`)

      await this.terminate()
    } catch (error) {
      await this.#filesystem.erase({ path: tmpFilePath })

      this.logger.error(`Failed to edit credentials file for '${env}' environment.`)

      await this.terminate()
    }
    /* c8 ignore stop */
  }
}
