import { Trade, TradeItem } from '../../main/database/entity/Trade'

export type PayType = -1 | 1 | 2 | 3
export type PayPlatform = 'WECHAT' | 'ALIPAY'
export type AlipayPayStatus = 'WAIT_BUYER_PAY' | 'TRADE_CLOSED' | 'TRADE_SUCCESS' | 'TRADE_FINISHED'
export type WeChatPayStatus =
  | 'SUCCESS'
  | 'REFUND'
  | 'NOTPAY'
  | 'CLOSED'
  | 'REVOKED'
  | 'USERPAYING'
  | 'PAYERROR'
  | 'ACCEPT'
export type PayStatus = AlipayPayStatus | WeChatPayStatus

export type TradeForm = Omit<Trade, 'id'> & {
  itemList: TradeFormItem[]
}

export type TradeFormItem = Pick<
  TradeItem,
  | 'productId'
  | 'productBarcode'
  | 'productName'
  | 'productSnapshotPrice'
  | 'discountAmount'
  | 'productPrice'
  | 'quantity'
  | 'subTotal'
>
