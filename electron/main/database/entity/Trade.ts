import { Column, Entity } from 'typeorm'
import { BaseEntity } from './base'
import { PayPlatform, PayStatus, PayType } from '../../../common/types/trade'

@Entity('trade')
export class Trade extends BaseEntity {
  @Column('varchar', { length: 255 })
  tradeNum: string
  @Column('date', {})
  creationDate: Date
  @Column('varchar', { length: 255 })
  cashier: string
  @Column('int')
  totalQuantity: number
  /** 商品原价总金额 */
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  itemOriginalPrice: number
  /** 商品总计打折金额 */
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  itemTotalDiscountAmount: number
  /** 商品总计金额 */
  @Column('decimal', { precision: 10, scale: 2 })
  itemPrice: number
  /** 订单打折金额 */
  @Column('decimal', { precision: 10, scale: 2 })
  discountAmount: number
  /** 订单需支付金额 */
  @Column('decimal', { precision: 10, scale: 2 })
  requirePay: number
  /** 订单实际支付金额 */
  @Column('decimal', { precision: 10, scale: 2 })
  actualPay: number
  /** 订单实际找零金额 */
  @Column('decimal', { precision: 10, scale: 2 })
  backChange: number
  /** 订单已退款金额 */
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  refundAmount: number
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  resultAmount: number
  @Column('int', {})
  payType: PayType
  @Column('varchar', { length: 255, nullable: true })
  payPlatform?: PayPlatform
  @Column('varchar', { length: 255, nullable: true })
  payOutTradeNo?: string
  @Column('varchar', { length: 255, nullable: true })
  payTransactionId?: string
  @Column('varchar', { length: 255, nullable: true })
  payStatus?: PayStatus
}

@Entity('trade_item')
export class TradeItem extends BaseEntity {
  @Column('bigint', {})
  tradeId: number
  @Column('bigint', {})
  productId: number
  @Column('varchar', { length: 255, nullable: true })
  productBarcode?: string
  @Column('varchar', { length: 255, nullable: true })
  productName?: string
  /** 单品原价金额 */
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  productSnapshotPrice: number
  /** 单品优惠金额 */
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number
  /** 单品最终售价 */
  @Column('decimal', { precision: 10, scale: 2 })
  productPrice: number
  @Column('int')
  quantity: number
  @Column('decimal', { precision: 10, scale: 2 })
  subTotal: number
}
