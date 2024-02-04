import { test } from '@japa/runner'

import { FileSystem } from '../src/filesystem.js'

test.group('FileSystem', () => {
  const filesystem = new FileSystem()

  test('should return false when file does not exist', async ({ assert }) => {
    const exists = await filesystem.exists({ path: 'test.json' })

    assert.equal(exists, false)
  })

  test('should return true when file exists', async ({ assert, fs }) => {
    await fs.createJson('test.json', {
      foo: 'bar',
    })

    const exists = await filesystem.exists({ path: `${fs.basePath}/test.json` })

    assert.equal(exists, true)
  })

  test('should read file content', async ({ assert, fs }) => {
    await fs.createJson('test.json', { foo: 'bar' })

    const content = await filesystem.read({ path: `${fs.basePath}/test.json` })

    assert.equal(content, JSON.stringify({ foo: 'bar' }))
  })

  test('should write file content', async ({ assert, fs }) => {
    await fs.mkdir('test')
    await filesystem.write({
      path: `${fs.basePath}/test/test.json`,
      data: JSON.stringify({ foo: 'bar' }),
    })

    await assert.fileEquals('test/test.json', `${JSON.stringify({ foo: 'bar' })}`)
  })

  test('should erase file', async ({ assert, fs }) => {
    await fs.mkdir('test')
    await filesystem.write({
      path: `${fs.basePath}/test/test.json`,
      data: JSON.stringify({ foo: 'bar' }),
    })
    await filesystem.erase({ path: `${fs.basePath}/test/test.json` })

    await assert.fileNotExists('test/test.json')
  })
})
