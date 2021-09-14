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

import { Credentials } from '../src/Credentials'
import CredentialsCreate from '../commands/CredentialsCreate'
import { fs, setupApplication } from '../test-helpers'

let app: ApplicationContract
let command: CredentialsCreate

test.group('Credentials', (group) => {
  group.beforeEach(async () => {
    app = await setupApplication()
    command = new CredentialsCreate(app, new Kernel(app))
    await command.run()
  })

  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('should throw an error when no credentials key file', async (assert) => {
    await fs.remove('resources/credentials/test.key')

    assert.throw(
      () =>
        new Credentials({
          env: 'test',
          credentialsPath: app.resourcesPath('/credentials'),
        }).initialize(),
      `E_CREDENTIALS_NO_KEY: Credentials key file for 'test' environment does not exist`
    )
  })

  test('should throw an error when no credentials file', async (assert) => {
    await fs.remove('resources/credentials/test.credentials')

    assert.throw(
      () =>
        new Credentials({
          env: 'test',
          credentialsPath: app.resourcesPath('/credentials'),
        }).initialize(),
      `E_CREDENTIALS_NO_FILE: Credentials file for 'test' environment does not exist`
    )
  })

  test('should initialize and populate environment variables', async (assert) => {
    new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    }).initialize()

    assert.equal(process.env.HELLO, 'world')
  })
})
