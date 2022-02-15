/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import test from 'japa'
import { Kernel } from '@adonisjs/core/build/standalone'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

import CredentialsCreate from '../commands/CredentialsCreate'
import CredentialsPipe from '../commands/CredentialsPipe'
import { fs, setupApplication } from '../test-helpers'

let app: ApplicationContract

test.group('Command - Credentials Pipe', (group) => {
  group.beforeEach(async () => {
    app = await setupApplication()
    const command = new CredentialsCreate(app, new Kernel(app))
    await command.run()
  })

  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('should throw an error when credentials key file does not exist', async (assert) => {
    await fs.remove('resources/credentials/test.key')

    const command = new CredentialsPipe(app, new Kernel(app))
    command.command = `echo 'test';`

    try {
      await command.run()
    } catch (error) {
      assert.equal(
        error.message,
        `E_CREDENTIALS_NO_KEY: Credentials key for 'test' environment does not exist, please set it in a file or in APP_CREDENTIALS_KEY environment variable`
      )
    }
  })

  test('should throw an error when credentials file does not exist', async (assert) => {
    await fs.remove('resources/credentials/test.credentials')

    const command = new CredentialsPipe(app, new Kernel(app))
    command.command = `echo 'test';`

    try {
      await command.run()
    } catch (error) {
      assert.equal(
        error.message,
        `E_CREDENTIALS_NO_FILE: Credentials file for 'test' environment does not exist`
      )
    }
  })
})
