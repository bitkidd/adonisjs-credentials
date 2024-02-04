import { test } from '@japa/runner'
import { AceFactory } from '@adonisjs/core/factories'

import CredentialsCreate from '../commands/сreate.js'

test.group('Command - Credentials Create', (group) => {
  group.each.teardown(async () => {
    delete process.env.NODE_ENV
    delete process.env.ADONIS_ACE_CWD
  })

  test('should create development (default) credentials and key files', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl, { importer: () => {} })
    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(CredentialsCreate, [])
    await command.exec()

    await assert.fileExists('resources/credentials/development.key')
    await assert.fileExists('resources/credentials/development.credentials')
  })

  test('should create credentials and key files for specified env', async ({ fs, assert }) => {
    const ace = await new AceFactory().make(fs.baseUrl, { importer: () => {} })
    await ace.app.init()
    ace.ui.switchMode('raw')

    const command = await ace.create(CredentialsCreate, ['--env=production'])
    await command.exec()

    await assert.fileExists('resources/credentials/production.key')
    await assert.fileExists('resources/credentials/production.credentials')
  })

  test('should log an error when called in production', async ({ fs }) => {
    const ace = await new AceFactory().make(fs.baseUrl, { importer: () => {} })
    await ace.app.init()
    ace.ui.switchMode('raw')

    process.env.NODE_ENV = 'production'

    const command = await ace.create(CredentialsCreate, [])
    await command.exec()

    command.assertLog('[ red(error) ] This command can only be used in development environment')
  })
})
