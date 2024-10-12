import { BrowserWindow } from 'electron'
import { initializeToastService } from './toast-service'

export function initService(win: BrowserWindow) {
  initializeToastService(win)
}
