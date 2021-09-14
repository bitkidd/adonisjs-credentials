/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/core/build/standalone'

export const fs = new Filesystem(join(__dirname, '..', 'tmp'))

/**
 * Setup application
 */
export async function setupApplication(
  additionalProviders?: string[],
  environment: 'web' | 'repl' | 'test' = 'test'
) {
  await fs.add('.env', '')
  await fs.add(
    'config/app.ts',
    `
    export const appKey = 'averylong32charsrandomsecretkey'
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }
    `
  )

  const app = new Application(fs.basePath, environment, {
    aliases: {
      App: './app',
    },
    providers: ['@adonisjs/core'].concat(additionalProviders || []),
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  if (process.env.DEBUG) {
    app.container.use('Adonis/Core/Event').on('db:query', (query) => {
      console.log({
        model: query.model,
        sql: query.sql,
        bindings: query.bindings,
      })
    })
  }

  return app
}
