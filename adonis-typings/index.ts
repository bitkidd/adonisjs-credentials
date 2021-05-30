declare module '@ioc:Adonis/Addons/Credentials' {
  export interface CredentialsContract {
    get(key: string): string
  }

  const Credentials: CredentialsContract
  export default Credentials
}
