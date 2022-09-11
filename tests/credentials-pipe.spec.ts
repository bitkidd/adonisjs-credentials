/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Kernel } from '@adonisjs/core/build/standalone'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

import CredentialsCreate from '../commands/CredentialsCreate'
import CredentialsPipe from '../commands/CredentialsPipe'
import { fs, setupApplication } from '../test-helpers'

let app: ApplicationContract

test.group('Command - Credentials Pipe', (group) => {
  group.setup(async () => {
    app = await setupApplication()
    await fs.add('math.js', 'console.log(1+1);')
  })

  group.each.setup(async () => {
    const command = new CredentialsCreate(app, new Kernel(app))
    await command.run()
  })

  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('should throw an error when credentials key file does not exist', async ({ assert }) => {
    await fs.remove('resources/credentials/test.key')

    const command = new CredentialsPipe(app, new Kernel(app))
    command.command = `math.js`

    assert.rejects(async () => await command.run())
  })

  test('should throw an error when credentials file does not exist', async ({ assert }) => {
    await fs.remove('resources/credentials/test.credentials')

    const command = new CredentialsPipe(app, new Kernel(app))
    command.command = `math.js`

    assert.rejects(async () => await command.run())
  })
})
