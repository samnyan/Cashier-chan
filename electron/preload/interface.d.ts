import {
  deleteProduct,
  findProductByBarcode,
  listProduct,
  updateProduct
} from '../main/database/service/product-service'
import { syncExternalProduct } from '../main/service/remote-product'
import {
  addTradeRefundAmount,
  getListPageSum,
  getTradeByPayOutTradeNo,
  getTradeByTradeNum,
  getTradeItem,
  listTrade,
  saveTradeAndItems,
  setTradeStatus,
  setTradeStatusById
} from '../main/database/service/trade-service'
import {
  deleteIndexGroupItem,
  getIndexGroupDetail,
  listHomeIndexGroup,
  listIndexGroup,
  listIndexGroupItem,
  updateIndexGroup,
  updateIndexGroupItem
} from '../main/database/service/index-group-service'
import { getItemDiscountInfo } from '../main/database/service/discount-campaign-service'

export interface IDatabaseAPI {
  listProduct: typeof listProduct
  findProductByBarcode: typeof findProductByBarcode
  updateProduct: typeof updateProduct
  deleteProduct: typeof deleteProduct
  syncExternalProduct: typeof syncExternalProduct

  listTrade: typeof listTrade
  getTradeItem: typeof getTradeItem
  saveTradeAndItems: typeof saveTradeAndItems
  getTradeByTradeNum: typeof getTradeByTradeNum
  getTradeByPayOutTradeNo: typeof getTradeByPayOutTradeNo
  setTradeStatus: typeof setTradeStatus
  getListPageSum: typeof getListPageSum
  setTradeStatusById: typeof setTradeStatusById
  addTradeRefundAmount: typeof addTradeRefundAmount

  listIndexGroup: typeof listIndexGroup
  listHomeIndexGroup: typeof listHomeIndexGroup
  updateIndexGroup: typeof updateIndexGroup
  listIndexGroupItem: typeof listIndexGroupItem
  updateIndexGroupItem: typeof updateIndexGroupItem
  deleteIndexGroupItem: typeof deleteIndexGroupItem
  getIndexGroupDetail: typeof getIndexGroupDetail

  getItemDiscountInfo: typeof getItemDiscountInfo
}

declare global {
  interface Window {
    database: IDatabaseAPI
  }
}
