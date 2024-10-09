import { ref } from 'vue'

let messageId = 0

export const toasts = ref<
  {
    type: 'success' | 'info' | 'warning' | 'error' | undefined
    message: string
    title: string
    timeout: number
    messageId: number
  }[]
>([])

export const showToast = (
  type: 'success' | 'info' | 'warning' | 'error' | undefined,
  message: string,
  title: string,
  timeout: number = 3000
) => {
  messageId++
  const id = messageId
  toasts.value.push({ type, message, title, timeout, messageId: id })
  setTimeout(() => {
    removeToast(id)
  }, timeout)
}

const removeToast = (id: number) => {
  const idx = toasts.value.findIndex((item) => item.messageId == id)
  if (idx >= 0) {
    toasts.value.splice(idx, 1)
  }
}

export const showToastSuccess = (message: string, title = '成功', timeout = 3000) => {
  showToast('success', message, title, timeout)
}

export const showToastError = (message: string, title = '失败', timeout = 3000) => {
  showToast('error', message, title, timeout)
}

window.ipcRenderer.on('toast-message', (_event, { type, message, title, timeout }) => {
  showToast(type, message, title, timeout)
})
