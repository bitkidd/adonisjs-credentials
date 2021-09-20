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

    // process.env.ENV_SILENT = 'true'
    delete process.env.APP_CREDENTIALS_KEY
    await command.run()
  })

  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('should pick up key from file and populate environment variables', async (assert) => {
    new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    }).initialize()

    assert.equal(process.env.HELLO, 'world')
  })

  test('should pick up key from process.env and populate environment variables', async (assert) => {
    process.env.APP_CREDENTIALS_KEY = await fs.get('resources/credentials/test.key')
    await fs.remove('resources/credentials/test.key')

    new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    }).initialize()

    assert.equal(process.env.HELLO, 'world')
  })

  test('should pick up key from .env and populate environment variables', async (assert) => {
    const key = await fs.get('resources/credentials/test.key')
    await fs.remove('resources/credentials/test.key')

    await fs.add('.env', `APP_CREDENTIALS_KEY=${key}`)

    new Credentials({
      env: 'test',
      dotenvPath: `${app.appRoot}/.env`,
      credentialsPath: app.resourcesPath('/credentials'),
    }).initialize()

    assert.equal(process.env.HELLO, 'world')
  })

  test('should pick up key from args and populate environment variables', async (assert) => {
    const key = await fs.get('resources/credentials/test.key')
    await fs.remove('resources/credentials/test.key')

    new Credentials({
      key,
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    }).initialize()

    assert.equal(process.env.HELLO, 'world')
  })

  test('should pick up key from credentials and return in', async (assert) => {
    const credentials = new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.equal(credentials.get('HELLO'), 'world')
  })

  test('should pick up all keys from credentials and return them', async (assert) => {
    const credentials = new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.deepStrictEqual(credentials.get(), { HELLO: 'world' })
  })

  test('should throw an error when no credentials key', async (assert) => {
    await fs.remove('resources/credentials/test.key')

    assert.throw(
      () =>
        new Credentials({
          env: 'test',
          credentialsPath: app.resourcesPath('/credentials'),
        }).initialize(),
      `E_CREDENTIALS_NO_KEY: Credentials key for 'test' environment does not exist, please set it in a file or in APP_CREDENTIALS_KEY environment variable`
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

  test('should throw an error when credentials file is corrupted', async (assert) => {
    await fs.cleanup()

    const subcommand = new CredentialsCreate(app, new Kernel(app))
    subcommand.content = '{ "hello": invalid_json'
    await subcommand.run()

    assert.throw(
      () =>
        new Credentials({
          env: 'test',
          credentialsPath: app.resourcesPath('/credentials'),
        }).initialize(),
      `E_CREDENTIALS_WRONG_FORMAT: Credentials file for 'test' environment is corrupted, should be a valid JSON`
    )
  })
})
