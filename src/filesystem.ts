import fspath from 'node:path'
import fs from 'node:fs/promises'

export class FileSystem {
  async exists({ path }: { path: string }) {
    try {
      await fs.stat(path)
      return true
    } catch {
      return false
    }
  }

  async read({ path }: { path: string }) {
    const content = await fs.readFile(path, { encoding: 'utf-8' })
    return content
  }

  async write({ path, data }: { path: string; data: any }) {
    const dirname = fspath.dirname(path)
    const dirnameExists = await this.exists({ path: dirname })

    if (!dirnameExists) {
      await fs.mkdir(dirname, { recursive: true })
    }

    await fs.writeFile(path, data, { encoding: 'utf-8' })
  }

  async erase({ path }: { path: string }) {
    await fs.unlink(path)
  }
}
