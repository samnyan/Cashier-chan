import { axiosService, PageResponse, setToken } from '../../common/request'
import { findProductByExternalId, saveProduct } from '../database/service/product-service'
import { Product } from '../database/entity/Product'
import { BrowserWindow, ipcMain } from 'electron'
import { PRODUCT_SYNC_EXTERNAL_PRODUCT, PRODUCT_SYNC_EXTERNAL_PRODUCT_CALLBACK } from '../../common/const'

interface SimpleAdminProduct {
  id: number
  name: string
  category: string
  imageList: { imgUrl: string }[]
  barcode: string
  retailPrice: number
}

export const getProductList = (token: string, page = 0, size = 100) => {
  return axiosService<PageResponse<SimpleAdminProduct>>({
    url: 'admin/warehouse/product/list',
    method: 'post',
    data: {
      page,
      size
    }
  })
}

export const syncExternalProduct = async (token: string, callback?: (progress, total) => void) => {
  console.log(token)
  setToken(token)
  let currentPage = 0
  let totalPage = 1
  while (currentPage < totalPage) {
    if (callback) {
      callback(currentPage, totalPage)
    }
    const resp = await getProductList(token, currentPage, 100)
    const data = resp.data
    totalPage = data.totalPages

    console.log(`[Product Sync] loaded ${currentPage} page, total ${totalPage}`)

    const updateList = []
    for (let item of data.content) {
      let product = await findProductByExternalId(item.id)
      if (product == null) {
        product = new Product()
        product.type = 2
        product.externalId = item.id
      }
      product.name = item.name
      if (item.imageList[0]) {
        product.imgUrl = item.imageList[0].imgUrl
      }
      product.category = item.category
      product.barcode = item.barcode
      product.price = item.retailPrice
      updateList.push(product)
    }
    await saveProduct(updateList)
    currentPage++
  }

  if (callback) {
    callback(currentPage, totalPage)
  }
}

export function initRemoteProduct(win: BrowserWindow) {
  ipcMain.handle(PRODUCT_SYNC_EXTERNAL_PRODUCT, (event, token) => {
    return syncExternalProduct(token, (progress, total) => {
      win.webContents.send(PRODUCT_SYNC_EXTERNAL_PRODUCT_CALLBACK, progress, total)
    })
  })
}
