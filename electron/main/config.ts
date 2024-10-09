import Store from 'electron-store'
import { app } from 'electron'
import path from 'node:path'

export type LocalConfig = {
  databasePath: string
}

const localConfig = new Store<LocalConfig>({
  defaults: {
    databasePath: path.join(app.getPath('userData'), 'pos.db')
  }
})

export const getDatabasePath = (): string => {
  return localConfig.get('databasePath')
}
