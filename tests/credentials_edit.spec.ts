import { test } from '@japa/runner'
import { AceFactory } from '@adonisjs/core/factories'

import CredentialsEdit from '../commands/edit.js'

test.group('Command - Credentials Edit', () => {
  test('should create a tmp file and terminate command when editor is set via a flag', async ({
    fs,
  }) => {
    const ace = await new AceFactory().make(fs.baseUrl, { importer: () => {} })
    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.create('resources/credentials/development.key', 'v2.DhVxW4Yx5gT03V5RNHecB0BtHkempOS4')
    await fs.create(
      'resources/credentials/development.credentials',
      'v2.OGs9XJwXbhPLIhud9lHrWTw2Nr9qRJ+lZXibDfOXPKE='
    )

    const command = await ace.create(CredentialsEdit, ['--editor=none'])
    await command.exec()

    command.assertLog(`[ green(success) ] Decrypted credentials file for 'development'`)
  })

  test('should create a tmp file and terminate command when editor is set via process.env', async ({
    fs,
  }) => {
    process.env.EDITOR = 'none'

    const ace = await new AceFactory().make(fs.baseUrl, { importer: () => {} })
    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.create('resources/credentials/development.key', 'v2.DhVxW4Yx5gT03V5RNHecB0BtHkempOS4')
    await fs.create(
      'resources/credentials/development.credentials',
      'v2.OGs9XJwXbhPLIhud9lHrWTw2Nr9qRJ+lZXibDfOXPKE='
    )

    const command = await ace.create(CredentialsEdit, [])
    await command.exec()

    command.assertLog(`[ green(success) ] Decrypted credentials file for 'development'`)

    delete process.env.EDITOR
  })

  test('should terminate command when editor is not set', async ({ fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, { importer: () => {} })
    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.create('resources/credentials/development.key', 'v2.DhVxW4Yx5gT03V5RNHecB0BtHkempOS4')
    await fs.create(
      'resources/credentials/development.credentials',
      'v2.OGs9XJwXbhPLIhud9lHrWTw2Nr9qRJ+lZXibDfOXPKE='
    )

    const command = await ace.create(CredentialsEdit, [])
    await command.exec()

    command.assertLog(
      `[ red(error) ] Credentials editor is unset, please set it in EDITOR environment variable or pass it as a flag`
    )
  })

  test('should create a temporary file with exact content', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl, { importer: () => {} })
    await ace.app.init()
    ace.ui.switchMode('raw')

    await fs.create('resources/credentials/development.key', 'v2.DhVxW4Yx5gT03V5RNHecB0BtHkempOS4')
    await fs.create(
      'resources/credentials/development.credentials',
      'v2.OGs9XJwXbhPLIhud9lHrWTw2Nr9qRJ+lZXibDfOXPKE='
    )

    const command = await ace.create(CredentialsEdit, ['--editor=none'])
    await command.exec()

    const files = await fs.readDir()
    const yamlFile = files.find((file) => file.basename.includes('yaml'))

    await assert.fileContains(yamlFile!.path, `hello: world`)
  })
})
