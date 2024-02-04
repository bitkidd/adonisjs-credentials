import yaml from 'yaml'
import { E_CREDENTIALS_INVALID_FORMAT } from './errors.js'

export class Parser {
  #prepare({ data }: { data: string }) {
    let format = 'unknown'
    let parsedData = null

    try {
      parsedData = JSON.parse(data)
      format = 'json'

      return { data: parsedData, format }
    } catch {
      try {
        parsedData = yaml.parse(data)
        format = 'yaml'

        return { data: parsedData, format }
      } catch {
        throw new E_CREDENTIALS_INVALID_FORMAT()
      }
    }
  }

  #transform({ data, prefix }: { data: any; prefix?: string }) {
    let result: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      const currentKey = prefix ? `${prefix}_${key}` : key

      if (value && typeof value === 'object') {
        const nestedResult = this.#transform({ data: value, prefix: currentKey })
        result = { ...result, ...nestedResult }
      } else {
        const envKey = currentKey.toUpperCase().replace(/[^A-Z0-9_]/g, '_')
        const envValue = String(value)
        result[envKey] = envValue
      }
    }

    return result
  }

  parse({ data }: { data: string }) {
    const { data: preparedData, format } = this.#prepare({ data })
    const transformedData = this.#transform({ data: preparedData })

    return { data: transformedData, format }
  }
}
