import { PayStatus } from '../../electron/common/types/trade'

export const requestWeChatMicroPay = (data: PayRequestDto): Promise<PayResponseDto<WeChatPayResultDto>> => {
  return Promise.reject()
}

export const queryWeChatMicroPay = (outTradeNo: string): Promise<PayResponseDto<WeChatPayResultDto>> => {
  return Promise.reject()
}

export const refundWeChat = (data: WeChatRefundRequestDto): Promise<WeChatMicroPayRefund> => {
  return Promise.reject()
}

export const requestAlipay = (data: PayRequestDto): Promise<PayResponseDto<AlipayResultDto>> => {
  return Promise.reject()
}

export const queryAlipay = (outTradeNo: string): Promise<PayResponseDto<AlipayResultDto>> => {
  return Promise.reject()
}

export const refundAlipay = (data: AlipayRefundRequestDto) => {
  return Promise.reject()
}

export interface PayRequestDto {
  authCode: string
  content: string
  deviceInfo: string
  totalFee: number
  tradeNum: string
}

export interface PayResponseDto<T> {
  needWaiting: boolean
  result?: T
  success: boolean
  tradeState?: PayStatus
  tradeStateDesc?: string
}

export interface WeChatPayResultDto {
  bankType: string
  cashFee: number
  cashFeeType: string
  couponFee?: number
  outTradeNo: string
  settlementTotalFee?: number
  timeEnd: string
  totalFee: number
  tradeType: string
  transactionId: string
}

export interface WeChatRefundRequestDto {
  outRefundNo: string
  outTradeNo: string
  refundDesc: string
  refundFee: number
}

export interface WeChatMicroPayRefund {
  appId: string
  cashRefundFee?: number
  createdOn?: Date
  deleted?: boolean
  id?: number
  mchId: string
  outRefundNo?: string
  outTradeNo: string
  refundChannel?: string
  refundFee: number
  refundId?: string
  refundRecvAccount?: string
  refundStatus?: string
  refundSuccessTime?: string
  settlementRefundFee?: number
  transactionId: string
  updatedOn?: Date
}

export interface AlipayResultDto {
  buyerLogonId?: string
  buyerPayAmount?: number
  discountAmount?: number
  invoiceAmount?: number
  mdiscountAmount?: number
  outTradeNo?: string
  paymentTime?: Date
  pointAmount?: number
  receiptAmount: number
  totalAmount?: number
  tradeNo?: string
}

export interface AlipayRefundRequestDto {
  outRequestNo: string
  outTradeNo: string
  refundAmount: number
  refundReason: string
}
