/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs'
import execa from 'execa'
import { args, BaseCommand, flags } from '@adonisjs/core/build/standalone'
import { Credentials } from '../src/Credentials'

export default class CredentialsPipe extends BaseCommand {
  public static commandName = 'credentials:pipe'
  public static description = 'Read and pipe credentials'
  public static settings = {
    loadApp: false,
    stayAlive: true,
  }

  @args.string({
    description: 'Specify an ace command to pipe credentials to',
  })
  public command: string

  @flags.string({
    description: 'Specify an environment for credentials file (default: development)',
  })
  public env: string

  public async run(): Promise<void> {
    const env = this.env || process.env.NODE_ENV || 'development'
    const [command, ...params] = this.command?.split(' ')
    const credentialsPath = this.application.resourcesPath('credentials')

    const credentials = new Credentials({ env, credentialsPath }).get()

    try {
      await execa.node(command, [...params], {
        stdio: 'inherit',
        env: { ...(credentials as Record<string, string>) },
      })
    } catch (error) {
      console.log(error)
    }
  }
}
