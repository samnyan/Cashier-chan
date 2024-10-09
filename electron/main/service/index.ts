import './remote-product'
import { BrowserWindow } from 'electron'
import { initRemoteProduct } from './remote-product'
import { initializeToastService } from './toast-service'

export function initService(win: BrowserWindow) {
  initRemoteProduct(win)
  initializeToastService(win)
}
