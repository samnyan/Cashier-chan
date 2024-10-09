import { getDataSource } from '../datasource'
import { Trade, TradeItem } from '../entity/Trade'
import { ipcMain } from 'electron'
import {
  TRADE_ADD_TRADE_REFUND_AMOUNT,
  TRADE_GET_LIST_PAGE_SUM,
  TRADE_GET_TRADE_BY_PAY_OUT_TRADE_NO,
  TRADE_GET_TRADE_BY_TRADE_NUM,
  TRADE_GET_TRADE_ITEM,
  TRADE_LIST_TRADE,
  TRADE_SAVE_TRADE_AND_ITEM,
  TRADE_SET_TRADE_STATUS,
  TRADE_SET_TRADE_STATUS_BY_ID
} from '../../../common/const'
import { Between, FindManyOptions, In } from 'typeorm'
import { mergeObject } from '../../../common/utils'
import dayjs from 'dayjs'
import { CNY } from '../../../common/currencyUtil'
import { PayStatus, TradeForm } from '../../../common/types/trade'

// List trade
export const listTrade = async (query?: FindManyOptions<Trade>) => {
  const repository = (await getDataSource()).getRepository(Trade)
  return await repository.findAndCount(query)
}

// Get trade item
export const getTradeItem = async (tradeId: number) => {
  const repository = (await getDataSource()).getRepository(TradeItem)
  return await repository.find({ where: { tradeId } })
}

export const getTradeByTradeNum = async (tradeNum: string) => {
  const repository = (await getDataSource()).getRepository(Trade)
  return await repository.findOneBy({ tradeNum })
}

export const getTradeByPayOutTradeNo = async (payOutTradeNo: string) => {
  const repository = (await getDataSource()).getRepository(Trade)
  return await repository.findOneBy({ payOutTradeNo })
}

export const saveTradeAndItems = async (trade: TradeForm) => {
  let t = new Trade()
  mergeObject(t, trade)

  t = await saveTrade(t)
  const tradeId = t.id
  const updateItemList: TradeItem[] = []
  for (let item of trade.itemList) {
    const ti = new TradeItem()
    mergeObject(ti, item)
    ti.tradeId = tradeId
    updateItemList.push(ti)
  }
  await saveTradeItem(updateItemList)
  return {
    trade,
    itemList: updateItemList
  }
}
export const saveTrade = async (trade: Trade) => {
  const repository = (await getDataSource()).getRepository(Trade)
  return await repository.save(trade)
}
export const saveTradeItem = async (tradeItems: TradeItem[]) => {
  const repository = (await getDataSource()).getRepository(TradeItem)
  return await repository.save(tradeItems)
}
export const setTradeStatus = async (payOutTradeNo: string, payStatus: PayStatus) => {
  const repository = (await getDataSource()).getRepository(Trade)
  return (await repository.update({ payOutTradeNo }, { payStatus })).affected
}
export const setTradeStatusById = async (tradeId: number, payStatus: PayStatus) => {
  const repository = (await getDataSource()).getRepository(Trade)
  return (await repository.update({ id: tradeId }, { payStatus })).affected
}
export const addTradeRefundAmount = async (tradeId: number, refundAmount: number) => {
  const repository = (await getDataSource()).getRepository(Trade)
  const trade = await repository.findOneBy({ id: tradeId })
  if (!trade) {
    throw new Error('没有找到订单！')
  }
  if (trade.refundAmount) {
    trade.refundAmount = CNY(trade.refundAmount).add(refundAmount).value
  } else {
    trade.refundAmount = refundAmount
  }
  return await repository.save(trade)
}

export const getListPageSum = async (date?: string) => {
  const repository = (await getDataSource()).getRepository(Trade)
  const totalRevenue = await repository.sum('resultAmount', [{ payStatus: In(['SUCCESS', 'TRADE_SUCCESS']) }])

  const from = dayjs(date).set('hour', 0).set('minute', 0).set('second', 0).toDate()
  const to = dayjs(date).set('hour', 23).set('minute', 59).set('second', 59).toDate()

  const todayRevenue = await repository.sum('resultAmount', [
    { payStatus: In(['SUCCESS', 'TRADE_SUCCESS']), creationDate: Between(from, to) }
  ])
  const todayWeChat = await repository.sum('resultAmount', [
    { payStatus: 'SUCCESS', payType: 1, payPlatform: 'WECHAT', creationDate: Between(from, to) }
  ])
  const todayWeChatScan = await repository.sum('resultAmount', [
    { payStatus: 'SUCCESS', payType: 3, payPlatform: 'WECHAT', creationDate: Between(from, to) }
  ])
  const todayAlipay = await repository.sum('resultAmount', [
    { payStatus: 'TRADE_SUCCESS', payType: 1, payPlatform: 'ALIPAY', creationDate: Between(from, to) }
  ])
  const todayAlipayScan = await repository.sum('resultAmount', [
    { payStatus: 'TRADE_SUCCESS', payType: 3, payPlatform: 'ALIPAY', creationDate: Between(from, to) }
  ])
  const todayCash = await repository.sum('resultAmount', [
    { payStatus: 'SUCCESS', payType: 2, creationDate: Between(from, to) }
  ])
  const todayWeChatRefund = await repository.sum('refundAmount', [
    { payStatus: 'REFUND', payPlatform: 'WECHAT', creationDate: Between(from, to) }
  ])
  const todayAlipayRefund = await repository.sum('refundAmount', [
    { payStatus: 'TRADE_CLOSED', payPlatform: 'ALIPAY', creationDate: Between(from, to) }
  ])
  const todayCount = await repository.countBy([
    { payStatus: In(['SUCCESS', 'TRADE_SUCCESS']), creationDate: Between(from, to) }
  ])
  const todayRefund = await repository.sum('refundAmount', [
    { payStatus: In(['TRADE_CLOSED', 'REFUND']), creationDate: Between(from, to) }
  ])

  return {
    totalRevenue,
    todayRevenue,
    todayWeChat,
    todayWeChatScan,
    todayAlipay,
    todayAlipayScan,
    todayCash,
    todayWeChatRefund,
    todayAlipayRefund,
    todayCount,
    todayRefund
  }
}

export function initTradeService() {
  ipcMain.handle(TRADE_LIST_TRADE, (event, args) => listTrade(args))
  ipcMain.handle(TRADE_GET_TRADE_ITEM, (event, args) => getTradeItem(args))
  ipcMain.handle(TRADE_SAVE_TRADE_AND_ITEM, (event, args) => saveTradeAndItems(args))
  ipcMain.handle(TRADE_GET_TRADE_BY_TRADE_NUM, (event, args) => getTradeByTradeNum(args))
  ipcMain.handle(TRADE_GET_TRADE_BY_PAY_OUT_TRADE_NO, (event, args) => getTradeByPayOutTradeNo(args))
  ipcMain.handle(TRADE_SET_TRADE_STATUS, (event, ...args) => setTradeStatus(args[0], args[1]))
  ipcMain.handle(TRADE_GET_LIST_PAGE_SUM, () => getListPageSum())
  ipcMain.handle(TRADE_SET_TRADE_STATUS_BY_ID, (event, ...args) => setTradeStatusById(args[0], args[1]))
  ipcMain.handle(TRADE_ADD_TRADE_REFUND_AMOUNT, (event, ...args) => addTradeRefundAmount(args[0], args[1]))
}
