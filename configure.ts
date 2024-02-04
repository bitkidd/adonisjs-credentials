/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'
import { FileSystem } from './src/filesystem.js'

export async function configure(command: ConfigureCommand) {
  const filesystem = new FileSystem()
  const codemods = await command.createCodemods()

  await codemods.updateRcFile((rcFile) => {
    rcFile.addCommand('@bitkidd/adonisjs-credentials/commands')
  })

  await codemods.makeUsingStub(stubsRoot, 'start.stub', {})

  try {
    const oldGitIgnoreFile = await filesystem.read({ path: `${command.app.makePath()}/.gitignore` })
    const keyRuleExists = oldGitIgnoreFile.includes('*.key')

    if (keyRuleExists) {
      command.logger.action('update .gitignore file').skipped()
    } else {
      const newGitIgnoreFile = `${oldGitIgnoreFile}\n*.key\n`

      await filesystem.write({
        path: `${command.app.makePath()}/.gitignore`,
        data: newGitIgnoreFile,
      })

      command.logger.action('update .gitignore file').succeeded()
    }
  } catch (error) {
    command.logger.action('update .gitignore file').failed(error)
  }
}
