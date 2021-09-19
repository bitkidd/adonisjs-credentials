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
import { fs, setupApplication } from '../test-helpers'
import { deepStrictEqual } from 'assert'

let app: ApplicationContract

test.group('Command - Credentials Create', (group) => {
  group.beforeEach(async () => {
    app = await setupApplication()
  })

  group.after(async () => {
    await fs.cleanup()
  })

  test('should create credentials files for default (development) environment', async (assert) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    await command.run()

    assert.isTrue(
      (await fs.exists(app.resourcesPath('/credentials/development.key'))) &&
        (await fs.exists(app.resourcesPath('/credentials/development.credentials')))
    )
  })

  test('should create credentials files for specified in process environment', async (assert) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    process.env.NODE_ENV = 'test'

    await command.run()

    assert.isTrue(
      (await fs.exists(app.resourcesPath('/credentials/test.key'))) &&
        (await fs.exists(app.resourcesPath('/credentials/test.credentials')))
    )
  })

  test('should create credentials files for specified in args environment', async (assert) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    command.env = 'production'

    await command.run()

    assert.isTrue(
      (await fs.exists(app.resourcesPath('/credentials/production.key'))) &&
        (await fs.exists(app.resourcesPath('/credentials/production.credentials')))
    )
  })

  test('should fail when credentials files exist', async (assert) => {
    const command = new CredentialsCreate(app, new Kernel(app))
    await command.run()

    assert.deepStrictEqual(command.ui.testingRenderer.logs, [
      {
        stream: 'stderr',
        message: `[ red(error) ]  Credentials files for 'test' environment already exist`,
      },
    ])
  })
})
