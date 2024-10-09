export type addPrefixToObject<T, P extends string> = {
  [K in keyof T as K extends string ? `${P}${K}` : never]: T[K]
}

export interface VDataTableServerUpdateOptions {
  page: number
  itemsPerPage: number
  sortBy: {
    key: string
    order: string
  }[]
  like?: {
    [key: string]: string
  }
  where?: {
    [key: string]: any
  }
}
export interface VDataTableServerQueryOptions {
  skip: number
  take: number
  order: {
    key: string
    order: string
  }[]
  like?: {
    [key: string]: string
  }
  where?: {
    [key: string]: any
  }
}

export interface DisplayValue {
  name: string
  color?: string
}
