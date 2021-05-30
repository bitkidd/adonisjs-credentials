import { CredentialsContract } from '@ioc:Adonis/Addons/Credentials'

export class Credentials implements CredentialsContract {
  public get(key: string): string {
    return `${key}`
  }
}
