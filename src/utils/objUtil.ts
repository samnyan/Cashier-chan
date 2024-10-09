import { unref } from 'vue'

export const mergeReactive = <U, T>(target: U, source: T, ignoreKeys: string[] = [], overwrite = false) => {
  const t = unref(target)
  if (overwrite) {
    Object.keys(source as any).forEach((key) => {
      if (!ignoreKeys.includes(key)) {
        target[key] = source[key]
      }
    })
  } else {
    Object.keys(t).forEach((key) => {
      if (!ignoreKeys.includes(key)) {
        target[key] = source[key]
      }
    })
  }
}
