import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setToken } from '../../electron/common/request'

export const useUserStore = defineStore('user', () => {
  const savedToken = localStorage.getItem('token')
  const savedUserInfo = localStorage.getItem('userInfo')
  let _userInfo
  try {
    if (savedUserInfo) {
      _userInfo = JSON.parse(savedUserInfo)
      if (savedToken) {
        setToken(savedToken)
      }
    }
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const token = ref<string>()
  const userInfo = ref(_userInfo)

  if (savedToken) {
    token.value = savedToken
  }

  const login = (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      resolve()
    })
  }

  const logout = () => {
    token.value = undefined
    userInfo.value = undefined
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    login,
    logout
  }
})
