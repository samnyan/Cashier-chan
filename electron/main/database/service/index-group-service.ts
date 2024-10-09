import { getDataSource } from '../datasource'
import { IndexGroup, IndexGroupItem } from '../entity/IndexGroup'
import { Product } from '../entity/Product'
import {
  INDEX_GROUP_DELETE_INDEX_GROUP_ITEM,
  INDEX_GROUP_GET_INDEX_GROUP_DETAIL,
  INDEX_GROUP_LIST_HOME_INDEX_GROUP,
  INDEX_GROUP_LIST_INDEX_GROUP,
  INDEX_GROUP_LIST_INDEX_GROUP_ITEM,
  INDEX_GROUP_UPDATE_INDEX_GROUP,
  INDEX_GROUP_UPDATE_INDEX_GROUP_ITEM
} from '../../../common/const'
import { ipcMain } from 'electron'
import { addPrefixToObject, VDataTableServerQueryOptions } from '../../../common/interface'

export const listIndexGroup = async () => {
  const repository = (await getDataSource()).getRepository(IndexGroup)

  return await repository.findAndCount()
}

export const listHomeIndexGroup = async () => {
  const repository = (await getDataSource()).getRepository(IndexGroup)

  return await repository.findAndCount({ where: { show: true } })
}

export const updateIndexGroup = async (req: string) => {
  const repository = (await getDataSource()).getRepository(IndexGroup)

  const request = JSON.parse(req) as IndexGroup
  let dbItem: IndexGroup
  if (request.id > 0) {
    dbItem = await repository.findOneBy({ id: request.id })
  } else {
    dbItem = new IndexGroup()
  }
  dbItem.show = request.show
  dbItem.name = request.name

  return await repository.save(dbItem)
}

export const listIndexGroupItem = async (query?: VDataTableServerQueryOptions) => {
  const repository = (await getDataSource()).getRepository(Product)

  const item = await repository
    .createQueryBuilder('product')
    .leftJoinAndSelect(IndexGroupItem, 'item', 'item.productId = product.id')
    .where('item.groupId = :groupId', { groupId: query?.where?.groupId })
    // .orderBy('item.sortOrder', 'DESC')
    .getRawMany()
  return [item, item.length]
}

export const updateIndexGroupItem = async (req: string) => {
  const repository = (await getDataSource()).getRepository(IndexGroupItem)

  const request = JSON.parse(req) as IndexGroupItem
  let dbItem: IndexGroupItem
  if (request.id > 0) {
    dbItem = await repository.findOneBy({ id: request.id })
  } else {
    dbItem = new IndexGroupItem()
  }
  dbItem.groupId = request.groupId
  dbItem.productId = request.productId
  dbItem.sortOrder = request.sortOrder

  return await repository.save(dbItem)
}

export const deleteIndexGroupItem = async (id: number) => {
  const repository = (await getDataSource()).getRepository(IndexGroupItem)

  return await repository.delete({ id })
}

export const getIndexGroupDetail = async (groupId: number) => {
  const repository = (await getDataSource()).getRepository(Product)

  const item: addPrefixToObject<Product, 'product_'>[] = await repository
    .createQueryBuilder('product')
    .leftJoinAndSelect(IndexGroupItem, 'item', 'item.productId = product.id')
    .where('item.groupId = :groupId', { groupId: groupId })
    .orderBy('item.sortOrder', 'DESC')
    .getRawMany()
  return [item, item.length]
}

export function initIndexGroupService() {
  ipcMain.handle(INDEX_GROUP_LIST_INDEX_GROUP, (event, args) => listIndexGroup())
  ipcMain.handle(INDEX_GROUP_LIST_HOME_INDEX_GROUP, (event, args) => listHomeIndexGroup())
  ipcMain.handle(INDEX_GROUP_UPDATE_INDEX_GROUP, (event, args) => updateIndexGroup(args))
  ipcMain.handle(INDEX_GROUP_LIST_INDEX_GROUP_ITEM, (event, args) => listIndexGroupItem(args))
  ipcMain.handle(INDEX_GROUP_UPDATE_INDEX_GROUP_ITEM, (event, args) => updateIndexGroupItem(args))
  ipcMain.handle(INDEX_GROUP_DELETE_INDEX_GROUP_ITEM, (event, args) => deleteIndexGroupItem(args))
  ipcMain.handle(INDEX_GROUP_GET_INDEX_GROUP_DETAIL, (event, args) => getIndexGroupDetail(args))
}
