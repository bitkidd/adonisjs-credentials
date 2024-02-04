/*
 * @bitkidd/adonisjs-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { flags, BaseCommand } from '@adonisjs/core/ace'

import { Vault } from '../src/vault.js'
import { FileSystem } from '../src/filesystem.js'

export default class CredentialsCreate extends BaseCommand {
  static commandName = 'credentials:create'
  static description = 'Create a credentials file'

  @flags.string({
    description: 'Specify an environment for credentials file (default: development)',
  })
  declare env: string

  #vault = new Vault()
  #filesystem = new FileSystem()

  async run() {
    const env = this.env || 'development'
    const initialContent = `hello: world`

    if (!['test', 'dev', 'development'].includes(process.env.NODE_ENV || 'development')) {
      this.logger.error('This command can only be used in development environment')
      return
    }

    const key = this.#vault.generateKey({ length: 32 })
    const content = this.#vault.encrypt({ data: initialContent, key })

    await this.#filesystem.write({
      data: key,
      path: this.app.makePath(`resources/credentials/${env}.key`),
    })
    this.logger.success(`Key file for '${env}' environment successfully created`)

    await this.#filesystem.write({
      data: content,
      path: this.app.makePath(`resources/credentials/${env}.credentials`),
    })
    this.logger.success(`Credentials file for '${env}' environment successfully created`)
  }
}
