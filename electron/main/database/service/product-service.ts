import { getDataSource } from '../datasource'
import { Product } from '../entity/Product'
import { ipcMain } from 'electron'
import {
  PRODUCT_DELETE_PRODUCT,
  PRODUCT_FIND_PRODUCT_BY_BARCODE,
  PRODUCT_LIST_PRODUCT,
  PRODUCT_UPDATE_PRODUCT
} from '../../../common/const'
import { FindManyOptions, Like } from 'typeorm'
import { VDataTableServerQueryOptions } from '../../../common/types/common'
import { getQueryObject } from '../../../common/utils'

export const listProduct = async (query?: VDataTableServerQueryOptions) => {
  const repository = (await getDataSource()).getRepository(Product)

  const options: FindManyOptions<Product> = getQueryObject(query)

  return await repository.findAndCount(options)
}

export const findProductByExternalId = async (externalId: number) => {
  const repository = (await getDataSource()).getRepository(Product)
  return await repository.findOneBy({ externalId })
}

export const findProductByBarcode = async (barcode: string) => {
  const repository = (await getDataSource()).getRepository(Product)
  return await repository.findOneBy({ barcode: Like('%' + barcode + '%') })
}

export const updateProduct = async (req: string) => {
  const repository = (await getDataSource()).getRepository(Product)

  const request = JSON.parse(req) as Product
  let dbProduct: Product
  if (request.id > 0) {
    dbProduct = await repository.findOneBy({ id: request.id })
  } else {
    dbProduct = new Product()
  }
  dbProduct.name = request.name
  dbProduct.imgUrl = request.imgUrl
  dbProduct.category = request.category
  dbProduct.barcode = request.barcode
  dbProduct.price = request.price

  return await repository.save(dbProduct)
}

export const saveProduct = async (product: Product[]) => {
  const repository = (await getDataSource()).getRepository(Product)
  return await repository.save(product)
}

export const deleteProduct = async (productId: number) => {
  const repository = (await getDataSource()).getRepository(Product)
  return await repository.delete({ id: productId })
}

export function initProductService() {
  ipcMain.handle(PRODUCT_LIST_PRODUCT, (event, args?: VDataTableServerQueryOptions) => listProduct(args))
  ipcMain.handle(PRODUCT_FIND_PRODUCT_BY_BARCODE, (event, args: string) => findProductByBarcode(args))
  ipcMain.handle(PRODUCT_UPDATE_PRODUCT, (event, args) => updateProduct(args))
  ipcMain.handle(PRODUCT_DELETE_PRODUCT, (event, args) => deleteProduct(args))
}
