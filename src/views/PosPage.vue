<script setup lang="ts">
import OrderSection from '../components/pos/OrderSection.vue'
import ProductSection from '../components/pos/ProductSection.vue'
import { onKeyStroke } from '@vueuse/core'
import { ref } from 'vue'
import Checkout from '../components/pos/Checkout.vue'
import { useCart } from '../store/cart'
import { showToastError } from '../store/toast'
import BarcodeInput from '../components/pos/BarcodeInput.vue'
import { AlipayResultDto, PayResponseDto, WeChatPayResultDto } from '../api/payment'
import { CNY } from '../../electron/common/currencyUtil'
import OrderCheck from '../components/pos/OrderCheck.vue'
import { barcode } from '../store/barcode'

const productSectionRef = ref<InstanceType<typeof ProductSection>>()

const cart = useCart()

onKeyStroke(['Enter'], (e) => {
  e.preventDefault()
  e.stopPropagation()
})

let checkoutLock = false
onKeyStroke([' '], (e) => {
  if (checkoutLock) {
    return
  }
  e.preventDefault()
  e.stopPropagation()
  onCheckout()
})

const orderCheckRef = ref<InstanceType<typeof OrderCheck>>()
const checkoutRef = ref<InstanceType<typeof Checkout>>()

const onCheckout = () => {
  if (cart.totalQuantity == 0) {
    showToastError('请先加入商品再进行结算')
    return
  }
  checkoutLock = true
  checkoutRef.value?.show(0)
}
const onCheckoutClose = () => {
  checkoutLock = false
}

const onWeChatPayCode = (code: string) => {
  checkoutRef.value?.scanWeChatCode(code)
}

const onAlipayCode = (code: string) => {
  checkoutRef.value?.scanAlipayCode(code)
}

const onOrderCode = (code: string) => {
  orderCheckRef.value?.check(code)
}

const showSuccess = ref(false)
const successCounter = ref(3)
let successInterval: NodeJS.Timeout
let successTimeout: NodeJS.Timeout
const weChatPayResult = ref<PayResponseDto>()
const alipayResult = ref<AlipayResultDto>()
const onShowSuccess = (timeout = 3000, resp?: { wechat: WeChatPayResultDto; alipay: AlipayResultDto }) => {
  if (resp) {
    weChatPayResult.value = resp.wechat
    alipayResult.value = resp.alipay
  }
  if (successInterval) {
    clearInterval(successInterval)
  }
  if (successTimeout) {
    clearTimeout(successTimeout)
  }
  showSuccess.value = true
  successCounter.value = timeout / 1000
  successInterval = setInterval(() => {
    successCounter.value--
  }, 1000)
  successTimeout = setTimeout(() => {
    showSuccess.value = false
    weChatPayResult.value = undefined
  }, timeout + 100)
}
const onSuccessClose = () => {
  if (successInterval) {
    clearInterval(successInterval)
  }
  if (successTimeout) {
    clearTimeout(successTimeout)
  }
}
const onTradeCheckClick = () => {
  orderCheckRef.value?.show()
}
</script>

<template>
  <div class="flex h-full w-full">
    <div class="flex flex-col w-full pt-2">
      <ProductSection ref="productSectionRef">
        <div class="flex justify-center">
          <v-btn variant="outlined" @click="onTradeCheckClick">订单查询</v-btn>
          <BarcodeInput
            @update="productSectionRef?.onProductUpdate"
            @wechat-code="onWeChatPayCode"
            @alipay-code="onAlipayCode"
            @order="onOrderCode"
          />
        </div>
      </ProductSection>
    </div>
    <div class="w-138 border-l border-l-solid border-l-neutral-200">
      <OrderSection @checkout="onCheckout" />
    </div>

    <OrderCheck ref="orderCheckRef">
      <div class="text-center mb-4">
        <div>请扫描或输入商户订单号</div>
        <div>
          <input v-model="barcode.code" class="border border-solid text-2xl font-bold h-12 w-96" />
        </div>
      </div>
    </OrderCheck>
    <Checkout ref="checkoutRef" @success="onShowSuccess" @close="onCheckoutClose" />

    <v-dialog v-model="showSuccess" max-width="500" @after-leave="onSuccessClose">
      <template #default="{ isActive }">
        <v-card title="订单完成">
          <v-card-text class="text-center">
            <div class="text-green-500">
              <v-icon icon="mdi-check-circle-outline" size="128" />
            </div>
            <div v-if="weChatPayResult">
              <div>微信支付成功</div>
              <div v-if="weChatPayResult.result">
                <div class="text-xl">
                  订单金额：
                  <span class="text-red-5 text-2xl font-bold">
                    {{ CNY(weChatPayResult.result.totalFee).format() }}
                  </span>
                </div>
                <div class="text-xl">
                  用户实付金额：
                  <span class="text-red-5 text-2xl font-bold">{{ CNY(weChatPayResult.result.cashFee).format() }}</span>
                </div>
                <div class="mt-8">商户订单号码：{{ weChatPayResult.result.outTradeNo }}</div>
                <div>微信流水单号：{{ weChatPayResult.result.transactionId }}</div>
              </div>
            </div>
            <div v-if="alipayResult">
              <div>支付宝成功</div>
              <div v-if="alipayResult.result">
                <div class="text-xl">
                  订单金额：
                  <span class="text-red-5 text-2xl font-bold">
                    {{ CNY(alipayResult.result.totalAmount).format() }}
                  </span>
                </div>
                <div class="text-xl">
                  用户实付金额：
                  <span class="text-red-5 text-2xl font-bold">
                    {{ CNY(alipayResult.result.receiptAmount).format() }}
                  </span>
                </div>
                <div class="mt-8">付款用户：{{ alipayResult.result.buyerLogonId }}</div>
                <div>商户订单号码：{{ alipayResult.result.outTradeNo }}</div>
                <div>支付宝流水单号：{{ alipayResult.result.tradeNo }}</div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :text="`完成(${successCounter}s)`" color="success" @click="isActive.value = false"></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>

<style scoped></style>
