import { contextBridge, ipcRenderer } from 'electron'
import { IDatabaseAPI } from './interface'
import {
  DISCOUNT_CAMPAIGN_GET_ITEM_DISCOUNT_INFO,
  INDEX_GROUP_DELETE_INDEX_GROUP_ITEM,
  INDEX_GROUP_GET_INDEX_GROUP_DETAIL,
  INDEX_GROUP_LIST_HOME_INDEX_GROUP,
  INDEX_GROUP_LIST_INDEX_GROUP,
  INDEX_GROUP_LIST_INDEX_GROUP_ITEM,
  INDEX_GROUP_UPDATE_INDEX_GROUP,
  INDEX_GROUP_UPDATE_INDEX_GROUP_ITEM,
  PRODUCT_DELETE_PRODUCT,
  PRODUCT_FIND_PRODUCT_BY_BARCODE,
  PRODUCT_LIST_PRODUCT,
  PRODUCT_SYNC_EXTERNAL_PRODUCT,
  PRODUCT_UPDATE_PRODUCT,
  TRADE_ADD_TRADE_REFUND_AMOUNT,
  TRADE_GET_LIST_PAGE_SUM,
  TRADE_GET_TRADE_BY_PAY_OUT_TRADE_NO,
  TRADE_GET_TRADE_BY_TRADE_NUM,
  TRADE_GET_TRADE_ITEM,
  TRADE_LIST_TRADE,
  TRADE_SAVE_TRADE_AND_ITEM,
  TRADE_SET_TRADE_STATUS,
  TRADE_SET_TRADE_STATUS_BY_ID
} from '../common/const'

contextBridge.exposeInMainWorld('database', {
  listProduct: (...args) => ipcRenderer.invoke(PRODUCT_LIST_PRODUCT, ...args),
  findProductByBarcode: (...args) => ipcRenderer.invoke(PRODUCT_FIND_PRODUCT_BY_BARCODE, ...args),
  updateProduct: (...args) => ipcRenderer.invoke(PRODUCT_UPDATE_PRODUCT, ...args),
  deleteProduct: (...args) => ipcRenderer.invoke(PRODUCT_DELETE_PRODUCT, ...args),
  syncExternalProduct: (...args) => {
    return ipcRenderer.invoke(PRODUCT_SYNC_EXTERNAL_PRODUCT, ...args)
  },

  listTrade: (...args) => ipcRenderer.invoke(TRADE_LIST_TRADE, ...args),
  getTradeItem: (...args) => ipcRenderer.invoke(TRADE_GET_TRADE_ITEM, ...args),
  saveTradeAndItems: (...args) => ipcRenderer.invoke(TRADE_SAVE_TRADE_AND_ITEM, ...args),
  getTradeByTradeNum: (...args) => ipcRenderer.invoke(TRADE_GET_TRADE_BY_TRADE_NUM, ...args),
  getTradeByPayOutTradeNo: (...args) => ipcRenderer.invoke(TRADE_GET_TRADE_BY_PAY_OUT_TRADE_NO, ...args),
  setTradeStatus: (...args) => ipcRenderer.invoke(TRADE_SET_TRADE_STATUS, ...args),
  getListPageSum: (...args) => ipcRenderer.invoke(TRADE_GET_LIST_PAGE_SUM, ...args),
  setTradeStatusById: (...args) => ipcRenderer.invoke(TRADE_SET_TRADE_STATUS_BY_ID, ...args),
  addTradeRefundAmount: (...args) => ipcRenderer.invoke(TRADE_ADD_TRADE_REFUND_AMOUNT, ...args),

  listIndexGroup: (...args) => ipcRenderer.invoke(INDEX_GROUP_LIST_INDEX_GROUP, ...args),
  listHomeIndexGroup: (...args) => ipcRenderer.invoke(INDEX_GROUP_LIST_HOME_INDEX_GROUP, ...args),
  updateIndexGroup: (...args) => ipcRenderer.invoke(INDEX_GROUP_UPDATE_INDEX_GROUP, ...args),
  listIndexGroupItem: (...args) => ipcRenderer.invoke(INDEX_GROUP_LIST_INDEX_GROUP_ITEM, ...args),
  updateIndexGroupItem: (...args) => ipcRenderer.invoke(INDEX_GROUP_UPDATE_INDEX_GROUP_ITEM, ...args),
  deleteIndexGroupItem: (...args) => ipcRenderer.invoke(INDEX_GROUP_DELETE_INDEX_GROUP_ITEM, ...args),
  getIndexGroupDetail: (...args) => ipcRenderer.invoke(INDEX_GROUP_GET_INDEX_GROUP_DETAIL, ...args),

  getItemDiscountInfo: (...args) => ipcRenderer.invoke(DISCOUNT_CAMPAIGN_GET_ITEM_DISCOUNT_INFO, ...args)
} as IDatabaseAPI)
