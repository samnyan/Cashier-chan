import { VDataTableServerQueryOptions } from './interface'
import { FindManyOptions, Like } from 'typeorm'

export const mergeObject = <U, T>(target: U, source: T, ignoreKeys: string[] = [], overwrite = false) => {
  if (overwrite) {
    Object.keys(source as any).forEach((key) => {
      if (!ignoreKeys.includes(key)) {
        target[key] = source[key]
      }
    })
  } else {
    Object.keys(target).forEach((key) => {
      if (!ignoreKeys.includes(key)) {
        target[key] = source[key]
      }
    })
  }
}

export const getQueryObject = (query?: VDataTableServerQueryOptions) => {
  const options: FindManyOptions = {
    take: query?.take,
    skip: query?.skip,
    where: {}
  }
  if (query?.like) {
    Object.keys(query.like).forEach((key) => {
      if (query.like[key] && query.like[key] != '') {
        options.where[key] = Like('%' + query.like[key] + '%')
      }
    })
  }
  return options
}
