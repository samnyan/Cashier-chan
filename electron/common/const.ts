import { DisplayValue } from './types/common'
import { PayPlatform, PayStatus } from './types/trade'

export const PRODUCT_LIST_PRODUCT = 'product-service:listProduct'
export const PRODUCT_FIND_PRODUCT_BY_BARCODE = 'product-service:findProductByBarcode'
export const PRODUCT_UPDATE_PRODUCT = 'product-service:updateProduct'
export const PRODUCT_DELETE_PRODUCT = 'product-service:deleteProduct'

export const PRODUCT_SYNC_EXTERNAL_PRODUCT = 'product-service:syncExternalProduct'
export const PRODUCT_SYNC_EXTERNAL_PRODUCT_CALLBACK = 'product-service:callback:syncExternalProduct'

export const TRADE_LIST_TRADE = 'trade-service:listTrade'
export const TRADE_GET_TRADE_ITEM = 'trade-service:getTradeItem'
export const TRADE_SAVE_TRADE_AND_ITEM = 'trade-service:saveTradeAndItems'
export const TRADE_GET_TRADE_BY_TRADE_NUM = 'trade-service:getTradeByTradeNum'
export const TRADE_GET_TRADE_BY_PAY_OUT_TRADE_NO = 'trade-service:getTradeByPayOutTradeNo'
export const TRADE_SET_TRADE_STATUS = 'trade-service:setTradeStatus'
export const TRADE_GET_LIST_PAGE_SUM = 'trade-service:getListPageSum'
export const TRADE_SET_TRADE_STATUS_BY_ID = 'trade-service:setTradeStatusById'
export const TRADE_ADD_TRADE_REFUND_AMOUNT = 'trade-service:addTradeRefundAmount'

export const INDEX_GROUP_LIST_INDEX_GROUP = 'index-group-service:listIndexGroup'
export const INDEX_GROUP_LIST_HOME_INDEX_GROUP = 'index-group-service:listHomeIndexGroup'
export const INDEX_GROUP_UPDATE_INDEX_GROUP = 'index-group-service:updateIndexGroup'
export const INDEX_GROUP_LIST_INDEX_GROUP_ITEM = 'index-group-service:listIndexGroupItem'
export const INDEX_GROUP_UPDATE_INDEX_GROUP_ITEM = 'index-group-service:updateIndexGroupItem'
export const INDEX_GROUP_DELETE_INDEX_GROUP_ITEM = 'index-group-service:deleteIndexGroupItem'
export const INDEX_GROUP_GET_INDEX_GROUP_DETAIL = 'index-group-service:getIndexGroupDetail'

export const DISCOUNT_CAMPAIGN_GET_ITEM_DISCOUNT_INFO = 'discount-campaign-service:getItemDiscountInfo'

export const DEVICE_ID = import.meta.env.VITE_DEVICE_ID

export const payTypeMapping = ['无', '条码支付', '现金支付', '扫码支付']

export const payPlatformMapping: Record<PayPlatform, DisplayValue> = {
  ALIPAY: { name: '支付宝', color: 'blue' },
  WECHAT: { name: '微信支付', color: 'green' }
}

export const payStatusMapping: Record<PayStatus, DisplayValue> = {
  WAIT_BUYER_PAY: { name: '等待买家付款', color: 'orange' },
  TRADE_CLOSED: { name: '交易关闭或退款', color: 'red' },
  TRADE_SUCCESS: { name: '支付成功', color: 'green' },
  TRADE_FINISHED: { name: '交易结束' },
  SUCCESS: { name: '成功', color: 'green' },
  REFUND: { name: '退款', color: 'red' },
  NOTPAY: { name: '未支付', color: 'orange' },
  CLOSED: { name: '已关闭', color: 'red' },
  REVOKED: { name: '已撤销', color: 'red' },
  USERPAYING: { name: '用户支付中', color: 'orange' },
  PAYERROR: { name: '支付失败', color: 'red' },
  ACCEPT: { name: '已接收', color: 'orange' }
}
