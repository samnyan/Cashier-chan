import { BrowserWindow } from 'electron'
import { setResponseInterceptor } from '../../common/request'

let mainWindow: BrowserWindow

export const initializeToastService = (window: BrowserWindow) => {
  mainWindow = window
  setResponseInterceptor((error) => {
    let message = ''
    if (error.status) {
      message += `[${error.status}] `
    }
    if (error.response?.data) {
      message += `${error.response.data.error || error.response.data.message}`
    }
    toastService.error(message, '网络请求错误')
  })
}

export const toastService = {
  success: (message: string, title = '成功', timeout: number = 3000) => {
    mainWindow.webContents.send('toast-message', { type: 'success', message, title, timeout })
  },
  info: (message: string, title = '信息', timeout: number = 3000) => {
    mainWindow.webContents.send('toast-message', { type: 'info', message, title, timeout })
  },
  warning: (message: string, title = '警告', timeout: number = 3000) => {
    mainWindow.webContents.send('toast-message', { type: 'warning', message, title, timeout })
  },
  error: (message: string, title = '失败', timeout: number = 3000) => {
    mainWindow.webContents.send('toast-message', { type: 'error', message, title, timeout })
  }
}
