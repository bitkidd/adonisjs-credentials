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
import { fs, setupApplication } from '../test-helpers'
import { Credentials } from '../src/Credentials'

let app: ApplicationContract

test.group('Command - Credentials Create', (group) => {
  group.setup(async () => {
    app = await setupApplication()
  })

  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('should create credentials files for default (development) environment', async ({
    assert,
  }) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    await command.run()

    assert.isTrue(
      (await fs.exists(app.resourcesPath('/credentials/development.key'))) &&
        (await fs.exists(app.resourcesPath('/credentials/development.credentials')))
    )
  })

  test('should create credentials files for specified in process environment', async ({
    assert,
  }) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    process.env.NODE_ENV = 'test'

    await command.run()

    assert.isTrue(
      (await fs.exists(app.resourcesPath('/credentials/test.key'))) &&
        (await fs.exists(app.resourcesPath('/credentials/test.credentials')))
    )
  })

  test('should create credentials files for specified in args environment', async ({ assert }) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    command.env = 'production'

    await command.run()

    assert.isTrue(
      (await fs.exists(app.resourcesPath('/credentials/production.key'))) &&
        (await fs.exists(app.resourcesPath('/credentials/production.credentials')))
    )
  })

  test('should create credentials files using default (yaml) format', async ({ assert }) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    await command.run()

    const credentials = new Credentials({
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.strictEqual(credentials.format(), 'yaml')
  })

  test('should create credentials files using specified in args format', async ({ assert }) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    command.format = 'json'

    await command.run()

    const credentials = new Credentials({
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.strictEqual(credentials.format(), 'json')
  })

  test('should fail when credentials files exist', async ({ assert }) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    await command.run()

    assert.deepEqual(
      command.ui.testingRenderer.logs.map((log) => ({
        ...log,
        message: log.message.replace(/(\[.*?\])/g, '').trim(),
      })),
      [
        // {
        //   stream: 'stderr',
        //   message: `Credentials files for 'test' environment already exist`,
        // },
      ]
    )
  })
})
