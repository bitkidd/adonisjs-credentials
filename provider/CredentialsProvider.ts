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
