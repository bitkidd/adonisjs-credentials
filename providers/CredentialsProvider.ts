/*
 * @bitkidd/adonis-credentials
 *
 * (c) Chirill Ceban <cc@bitkidd.dev>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Credentials } from '../src/Credentials'

export default class CredentialsProvider {
  constructor(protected app: ApplicationContract) {}

  public async register() {
    this.app.container.singleton('Adonis/Addons/Credentials', () => {
      return new Credentials()
    })
  }
}
