/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs'
import { BaseCommand, flags } from '@adonisjs/core/build/standalone'
import { Vault } from '../src/Vault'

export default class CredentialsCreate extends BaseCommand {
  public static commandName = 'credentials:create'
  public static description = 'Create a credentials file'

  @flags.string({
    description: 'Specify an environment for credentials file (default: development)',
  })
  public env: string

  @flags.string({
    description: 'Specify initial content for credentials file (default: { "hello": "world" })',
  })
  public content: string

  public async run(): Promise<void> {
    const env = this.env || process.env.NODE_ENV || 'development'
    const initialContent = this.content || '{ "hello": "world" }'
    const credentialsPath = this.application.resourcesPath('credentials')

    const key = Vault.generateKey()
    const content = Vault.encrypt(initialContent, key)

    if (
      fs.existsSync(`${credentialsPath}/${env}.key`) ||
      fs.existsSync(`${credentialsPath}/${env}.credentials`)
    ) {
      this.logger.error(`Credentials files for '${env}' environment already exist`)
      return
    }

    this.generator
      .addFile(env, { extname: '.key' })
      .destinationDir(credentialsPath)
      .stub(key, { raw: true })
    this.generator
      .addFile(env, { extname: '.credentials' })
      .destinationDir(credentialsPath)
      .stub(content, { raw: true })

    await this.generator.run()

    this.logger.success(`Credentials files for '${env}' environment successfully created`)
  }
}
