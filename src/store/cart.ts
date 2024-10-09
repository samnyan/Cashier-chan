import { defineStore } from 'pinia'
import type { Product } from '../../electron/main/database/entity/Product'
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { CNY } from '../../electron/common/currencyUtil'

const calculateItemSubTotal = (item: CartItem) => {
  return CNY(item.itemPrice).multiply(item.quantity).value
}

export const useCart = defineStore('cart', () => {
  const tradeCreate = useStorage<string>('tradeCreate', '')
  const cartList = useStorage<CartItem[]>('cartList', [])
  const cartSuccessText = ref<string>()
  const cartHighlightIndex = ref(-1)

  const addProduct = async (product: Product) => {
    const list = cartList.value
    if (list.length == 0) {
      tradeCreate.value = dayjs().toISOString()
    }
    const itemIndex = list.findIndex((item) => item.product.id == product.id)

    let prefix: string
    const itemText = ` [${product.barcode}] ${product.name}`
    let suffix = ''
    if (itemIndex >= 0) {
      const item = list[itemIndex]
      const originalQuantity = item.quantity
      item.quantity++

      item.subTotal = calculateItemSubTotal(item)
      list[itemIndex] = item

      cartHighlightIndex.value = itemIndex

      prefix = '商品数量增加'
      suffix = ` 产品件数： ${originalQuantity} -> ${item.quantity}`
    } else {
      let discountRate = 100

      // Get discount rule
      const discountRule = await window.database.getItemDiscountInfo(product.id)
      if (discountRule) {
        console.log('discountRule', discountRule)
        if (discountRule.campaign_discountRate) {
          discountRate = discountRule.campaign_discountRate
        }
      }

      const item: CartItem = {
        index: list.length,
        product,
        quantity: 1
      }
      const itemPrice = CNY(product.price).multiply(discountRate).divide(100)
      item.itemPrice = itemPrice.value
      item.discountAmount = CNY(product.price).subtract(itemPrice).value

      item.subTotal = calculateItemSubTotal(item)

      list.unshift(item)
      console.log(item)

      cartHighlightIndex.value = 0
      list.forEach((item, index) => (item.index = index))

      prefix = '新建商品'
    }

    cartSuccessText.value = prefix + itemText + suffix

    setTimeout(() => {
      cartSuccessText.value = undefined
      cartHighlightIndex.value = -1
    }, 3000)
    cartList.value = list
  }

  const removeProduct = (index: number) => {
    const list = cartList.value
    list.splice(index, 1)
    cartList.value = list
  }

  const clearCart = () => {
    cartList.value = []
    tradeCreate.value = undefined
  }

  const setQuantity = (index: number, quantity: number) => {
    const list = cartList.value
    const item = list[index]
    if (quantity <= 0) {
      return
    }
    item.quantity = quantity
    item.subTotal = calculateItemSubTotal(item)
    list[index] = item
    cartList.value = list
  }

  const totalAmount = computed(() => {
    if (cartList.value.length == 0) {
      return 0
    } else {
      let subTotal = CNY(0)
      for (let item of cartList.value) {
        subTotal = subTotal.add(item.subTotal)
      }
      return subTotal.value
    }
  })

  const totalItemDiscount = computed(() => {
    if (cartList.value.length == 0) {
      return 0
    } else {
      let discountTotal = CNY(0)
      for (let item of cartList.value) {
        discountTotal = discountTotal.add(CNY(item.discountAmount).multiply(item.quantity))
      }
      return discountTotal.value
    }
  })

  const totalOriginalPrice = computed(() => {
    if (cartList.value.length == 0) {
      return 0
    } else {
      let subTotal = CNY(0)
      for (let item of cartList.value) {
        subTotal = subTotal.add(CNY(item.product.price).multiply(item.quantity))
      }
      return subTotal.value
    }
  })

  const totalQuantity = computed(() => {
    return cartList.value.reduce((acc, item) => acc + item.quantity, 0)
  })

  return {
    tradeCreate,
    cartList,
    cartSuccessText,
    totalAmount,
    totalItemDiscount,
    totalOriginalPrice,
    totalQuantity,
    addProduct,
    removeProduct,
    setQuantity,
    clearCart
  }
})

export interface CartItem {
  index: number
  product: Product
  /** 折扣金额 */
  discountAmount: number
  /** 最终单价 */
  itemPrice: number
  /** 商品数量 */
  quantity: number
  /** 商品小计 */
  subTotal: number
}
