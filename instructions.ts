import { promises as fsp } from 'fs'
import * as sinkStatic from '@adonisjs/sink'

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions(projectRoot: string, _, sink: typeof sinkStatic) {
  const gitignoreFilePath = `${projectRoot}/.gitignore`
  const gitignoreFile = await fsp.readFile(gitignoreFilePath)

  if (!gitignoreFile.toString('utf-8').match(/\*.key/g)) {
    await fsp.appendFile(gitignoreFilePath, '\n*.key')
    sink.logger.success('Updated .gitignore file and added *.key exclusion')
  } else {
    sink.logger.success('Found a *.key exclusion in .gitignore file, awesome!')
  }
}
