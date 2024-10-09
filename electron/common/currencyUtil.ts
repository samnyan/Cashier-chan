import currency from 'currency.js'

export const CNY = (value) => currency(value, { symbol: '￥', precision: 2 })
