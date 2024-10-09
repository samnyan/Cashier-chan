import axios, { AxiosError, AxiosRequestConfig } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    ignoreAuth?: boolean
  }
}

export interface ApiError {
  error: string
}

export type ErrorBody = ApiError & ApiResult<void>

let token: string
let responseErrorHandler: (error: AxiosError<ErrorBody>) => void

export const setToken = (t: string) => {
  token = t
}

export const setResponseInterceptor = (handler: typeof responseErrorHandler) => {
  responseErrorHandler = handler
}

export const axiosService = axios.create({
  baseURL: undefined,
  timeout: 30 * 1000
})

axiosService.interceptors.request.use(
  (request) => {
    if (request.headers) {
      if (token && !request.ignoreAuth) {
        request.headers['Authorization'] = `Bearer ${token}`
      } else {
        delete request.headers['Authorization']
      }
    }
    return request
  },
  (err: any) => {
    console.error('onRejected', err)
    Promise.reject(err)
  }
)

axiosService.interceptors.response.use(
  (value) => {
    if (value.status != 200) {
      console.error(value)
      throw new Error('Error when request to api.')
    }
    return value.data
  },
  (err) => {
    if (responseErrorHandler) {
      responseErrorHandler(err)
    }
    console.error('[interceptors.response]', err)
    return Promise.reject(err)
  }
)

export function request<T>(config: AxiosRequestConfig) {
  return axiosService(config) as Promise<T>
}
