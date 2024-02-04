import { Exception } from '@poppinss/utils'

export const E_CREDENTIALS_INVALID = class CredentialsException extends Exception {
  static message = 'Credentials validation failed for one or more items'
  static code = 'E_CREDENTIALS_INVALID'
  help: string = ''
}

export const E_CREDENTIALS_UNKNOWN_VERSION = class CredentialsException extends Exception {
  static message = 'Credentials file or key version is unknown'
  static code = 'E_CREDENTIALS_UNKNOWN_VERSION'
  help: string = ''
}

export const E_CREDENTIALS_INVALID_FORMAT = class CredentialsException extends Exception {
  static message = 'Credentials file format is invalid, should be YAML or JSON'
  static code = 'E_CREDENTIALS_INVALID_FORMAT'
  help: string = ''
}

export const E_CREDENTIALS_CANNOT_DECRYPT = class CredentialsException extends Exception {
  static message = 'Credentials cannot be decrypted, wrong key of credential file is corrupted'
  static code = 'E_CREDENTIALS_CANNOT_DECRYPT'
  help: string = ''
}

export const E_CREDENTIALS_MISSING_KEY = class CredentialsException extends Exception {
  static message =
    'Credentials key is missing, please set it in a file or in APP_CREDENTIALS_KEY environment variable'
  static code = 'E_CREDENTIALS_MISSING_KEY'
  help: string = ''
}
