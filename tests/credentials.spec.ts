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

import { Credentials } from '../src/Credentials'
import CredentialsCreate from '../commands/CredentialsCreate'
import { fs, setupApplication } from '../test-helpers'

let app: ApplicationContract
let command: CredentialsCreate

test.group('Credentials', (group) => {
  group.setup(async () => {
    app = await setupApplication()
  })

  group.each.setup(async () => {
    command = new CredentialsCreate(app, new Kernel(app))
    command.env = 'test'

    // process.env.ENV_SILENT = 'true'
    delete process.env.APP_CREDENTIALS_KEY
    await command.run()
  })

  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('should pick up key from file and populate environment variables', async ({ assert }) => {
    new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    }).initialize()

    assert.equal(process.env.HELLO, 'world')
  })

  test('should pick up key from process.env and populate environment variables', async ({
    assert,
  }) => {
    process.env.APP_CREDENTIALS_KEY = await fs.get('resources/credentials/test.key')
    await fs.remove('resources/credentials/test.key')

    new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    }).initialize()

    assert.equal(process.env.HELLO, 'world')
  })

  test('should pick up key from .env and populate environment variables', async ({ assert }) => {
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

  test('should pick up key from args and populate environment variables', async ({ assert }) => {
    const key = await fs.get('resources/credentials/test.key')
    await fs.remove('resources/credentials/test.key')

    new Credentials({
      key,
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    }).initialize()

    assert.equal(process.env.HELLO, 'world')
  })

  test('should pick up key from credentials and return in', async ({ assert }) => {
    const credentials = new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.equal(credentials.get('HELLO'), 'world')
  })

  test('should pick up all keys from credentials and return them', async ({ assert }) => {
    const credentials = new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.deepEqual(credentials.get(), { HELLO: 'world' })
  })

  test('should return credentials class when initialized', async ({ assert }) => {
    const credentials = new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.typeOf(credentials, 'object')
  })

  test('should return credentials key', async ({ assert }) => {
    const key = await fs.get('resources/credentials/test.key')
    const credentials = new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.strictEqual(credentials.key(), key)
  })

  test('should return credentials plain content', async ({ assert }) => {
    const credentials = new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.strictEqual(credentials.content(), 'hello: world')
  })

  test('should return credentials content format', async ({ assert }) => {
    const credentials = new Credentials({
      env: 'test',
      credentialsPath: app.resourcesPath('/credentials'),
    })

    assert.strictEqual(credentials.format(), 'yaml')
  })

  test('should throw an error when no credentials key', async ({ assert }) => {
    await fs.remove('resources/credentials/test.key')

    assert.throws(
      () =>
        new Credentials({
          env: 'test',
          credentialsPath: app.resourcesPath('/credentials'),
        }).initialize(),
      `E_CREDENTIALS_NO_KEY: Credentials key for 'test' environment does not exist, please set it in a file or in APP_CREDENTIALS_KEY environment variable`
    )
  })

  test('should throw an error when no credentials file', async ({ assert }) => {
    await fs.remove('resources/credentials/test.credentials')

    assert.throws(
      () =>
        new Credentials({
          env: 'test',
          credentialsPath: app.resourcesPath('/credentials'),
        }).initialize(),
      `E_CREDENTIALS_NO_FILE: Credentials file for 'test' environment does not exist`
    )
  })
})
