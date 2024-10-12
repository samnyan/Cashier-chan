<script setup lang="ts">
import { barcode } from '../../store/barcode'
import { CNY } from '../../../electron/common/currencyUtil'
import { computed, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { CartItem, useCart } from '../../store/cart'
import { AlipayResultDto, PayResponseDto, WeChatPayResultDto } from '../../api/payment'
import { useWeChatMicroPay } from '../../composables/useWeChatMicroPay'
import { DEVICE_ID } from '../../../electron/common/const'
import { useAlipay } from '../../composables/useAlipay'
import CashKeypad from './CashKeypad.vue'
import currency from 'currency.js'
import { PayPlatform, TradeForm } from '../../../electron/common/types/trade'

const emits = defineEmits(['success', 'close'])

const cart = useCart()
const showCheckout = ref(false)

const paymentForm = reactive<PaymentForm>({
  actualPay: 0,
  discountAmount: 0,
  backChange: 0
})
const cashInputSelection = ref<'actualPay' | 'discountAmount' | 'backChange'>('actualPay')

const getTradeIds = () => {
  const date = dayjs(cart.tradeCreate)
  const tradeNum = '9' + date.format('YYYYMMDDHHmmss') + DEVICE_ID
  return {
    date,
    tradeNum
  }
}

const onDirectCodeScan = () => {
  showCheckout.value = true
  onBarcodeInit()
}

const weChatPayService = useWeChatMicroPay(getTradeIds, paymentForm, showCheckout, onDirectCodeScan)
const alipayService = useAlipay(getTradeIds, paymentForm, showCheckout, onDirectCodeScan)

const resetPayment = () => {
  barcode.releaseInput()
  payMode.value = 0
  paymentForm.actualPay = 0
  paymentForm.discountAmount = 0
  paymentForm.backChange = 0
}

const init = (mode: number) => {
  showCheckout.value = true
  payMode.value = mode
  barcode.code = ''
  weChatPayService.reset()
  alipayService.reset()
  payPlatform.value = undefined
  onBarcodeInit()
}

const payMode = ref(1)
const payPlatform = ref<PayPlatform | undefined>()
const scanPayPlatform = ref<'WECHAT' | 'ALIPAY'>('WECHAT')

const onBarcodeInit = () => {
  payMode.value = 0
  paymentForm.actualPay = cart.totalAmount
  barcode.releaseInput()
}

const payMethod = ref([
  {
    name: '条码支付',
    key: 'barcode',
    icon: 'barcode-scan',
    callback: () => {
      onBarcodeInit()
    }
  },
  {
    name: '现金支付',
    key: 'cash',
    icon: 'cash-100',
    callback: () => {
      payMode.value = 1
      barcode.requestInput()
      resetCashPayment()
    }
  },
  {
    name: '扫码付款',
    key: 'scan',
    icon: 'qrcode-scan',
    callback: () => {
      payMode.value = 2
      barcode.requestInput()
      resetCashPayment()
      paymentForm.actualPay = cart.totalAmount
    }
  }
])

const resetCashPayment = () => {
  paymentForm.actualPay = 0
  paymentForm.discountAmount = 0
  paymentForm.backChange = 0
}

const getTradeForm = () => {
  const totalAmount = cart.totalAmount
  const ids = getTradeIds()
  const trade: TradeForm = {
    tradeNum: ids.tradeNum,
    creationDate: ids.date.toDate(),
    cashier: 'default',
    totalQuantity: cart.totalQuantity,
    itemOriginalPrice: cart.totalOriginalPrice,
    itemTotalDiscountAmount: cart.totalItemDiscount,
    itemPrice: totalAmount,
    discountAmount: 0,
    requirePay: totalAmount,
    actualPay: 0,
    backChange: 0,
    refundAmount: 0,
    resultAmount: 0,
    payType: -1,
    payPlatform: undefined,
    payOutTradeNo: undefined,
    payTransactionId: undefined,
    payStatus: undefined,
    itemList: []
  }

  for (let item: CartItem of cart.cartList) {
    trade.itemList.push({
      productId: item.product.id,
      productBarcode: item.product.barcode,
      productName: item.product.name,
      productSnapshotPrice: item.product.price,
      discountAmount: item.discountAmount,
      productPrice: item.itemPrice,
      quantity: item.quantity,
      subTotal: item.subTotal
    })
  }
  return trade
}

const onCompleteCashPay = () => {
  const trade = getTradeForm()
  trade.payType = 2
  trade.actualPay = paymentForm.actualPay
  trade.discountAmount = paymentForm.discountAmount
  trade.backChange = paymentForm.backChange

  trade.resultAmount = paymentForm.actualPay - paymentForm.backChange

  trade.payStatus = 'SUCCESS'
  window.database.saveTradeAndItems(trade).then(() => {
    cart.clearCart()
    showCheckout.value = false
    resetPayment()
    emits('success')
  })
}

const onCompleteWeChatPay = (resp: PayResponseDto<WeChatPayResultDto>) => {
  const trade = getTradeForm()
  trade.payType = 1
  if (resp.result) {
    trade.payTransactionId = resp.result.transactionId
    trade.actualPay = resp.result.cashFee
    trade.resultAmount = trade.actualPay
  }
  trade.payOutTradeNo = weChatPayService.currentOutPayNumber.value
  trade.payStatus = resp.tradeState
  trade.payPlatform = 'WECHAT'

  window.database.saveTradeAndItems(trade).then(() => {
    cart.clearCart()
    showCheckout.value = false
    resetPayment()
    emits('success', 8000, { wechat: resp })
  })
}

const onCompleteAlipay = (resp: PayResponseDto<AlipayResultDto>) => {
  const trade = getTradeForm()
  trade.payType = 1
  if (resp.result) {
    trade.payTransactionId = resp.result.tradeNo
    trade.actualPay = resp.result.receiptAmount
    trade.resultAmount = trade.actualPay
  }
  trade.payOutTradeNo = alipayService.currentOutPayNumber.value
  trade.payStatus = resp.tradeState
  trade.payPlatform = 'ALIPAY'

  window.database.saveTradeAndItems(trade).then(() => {
    cart.clearCart()
    showCheckout.value = false
    resetPayment()
    emits('success', 8000, { alipay: resp })
  })
}

const onCompleteScanPay = () => {
  const trade = getTradeForm()
  trade.payType = 3
  trade.actualPay = paymentForm.actualPay
  trade.resultAmount = trade.actualPay
  trade.payPlatform = scanPayPlatform.value
  trade.payStatus = 'TRADE_SUCCESS'

  window.database.saveTradeAndItems(trade).then(() => {
    cart.clearCart()
    showCheckout.value = false
    resetPayment()
    emits('success', 5000, { scanPay: { platform: scanPayPlatform.value, amount: paymentForm.actualPay } })
  })
}

const scanWeChatCode = (code: string) => {
  payPlatform.value = 'WECHAT'
  weChatPayService.doScanWeChatCode(code).then(onCompleteWeChatPay)
}

const scanAlipayCode = (code: string) => {
  payPlatform.value = 'ALIPAY'
  alipayService.doScanAlipayCode(code).then(onCompleteAlipay)
}
const onCancel = () => {
  showCheckout.value = false
  resetPayment()
}
const onPaymentClose = () => {
  resetPayment()
  emits('close')
}

const onInputFocus = (ev: any, type: typeof cashInputSelection.value) => {
  cashInputSelection.value = type
  const i = ev.target as HTMLInputElement
  i.type = 'text'
  i.setSelectionRange(0, i.value.length)
  i.type = 'number'
}

let specialQueue = ''

const onNumberClick = (num: number) => {
  const val = String(paymentForm[cashInputSelection.value])
  const flag = specialQueue == '.'
  paymentForm[cashInputSelection.value] = Number(
    String(paymentForm[cashInputSelection.value]) + specialQueue + String(num)
  )
  specialQueue = ''
  if (num == 0) {
    if (flag) {
      specialQueue = '.0'
    } else if (val.indexOf('.') >= 0) {
      specialQueue = '0'
    }
  }
  document.getElementById(cashInputSelection.value)?.focus()
}

const onMoneyClick = (num: number) => {
  const val = paymentForm[cashInputSelection.value]
  paymentForm[cashInputSelection.value] = val + num
}

const onDotClick = () => {
  specialQueue = '.'
  paymentForm[cashInputSelection.value] = Number(String(paymentForm[cashInputSelection.value]) + '.')
  document.getElementById(cashInputSelection.value)?.focus()
}

const onBackSpaceClick = () => {
  const val = String(paymentForm[cashInputSelection.value])
  if (val.length > 1) {
    paymentForm[cashInputSelection.value] = Number(val.substring(0, val.length - 1))
  } else {
    paymentForm[cashInputSelection.value] = 0
  }
  document.getElementById(cashInputSelection.value)?.focus()
}

const onRateDiscount = (rate: number) => {
  const resultAmount = CNY(cart.totalAmount).multiply(rate)

  paymentForm.discountAmount = CNY(cart.totalAmount).subtract(resultAmount).value
  paymentForm.actualPay = resultAmount.value
}

const roundAll = computed(() => {
  const amount = CNY(cart.totalAmount)
  return amount.subtract(amount.dollars())
})

const onRoundAmount = (amount: currency) => {
  paymentForm.discountAmount = amount.value
}

defineExpose({
  show: init,
  scanWeChatCode,
  scanAlipayCode
})
</script>

<template>
  <v-dialog v-model="showCheckout" width="800" min-height="600" persistent @after-leave="onPaymentClose">
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-text class="flex">
          <v-item-group v-model="payMode" mandatory selected-class="bg-primary">
            <div class="flex flex-col gap-2">
              <v-item v-for="item of payMethod" :key="item.key" v-slot="{ isSelected, selectedClass, toggle }">
                <v-card
                  :class="['d-flex align-center justify-center', selectedClass]"
                  height="120"
                  width="90"
                  dark
                  @click="
                    () => {
                      toggle && toggle()
                      if (item.callback) {
                        item.callback()
                      }
                    }
                  "
                >
                  <div class="text-center">
                    <div>
                      <v-icon :icon="'mdi-' + item.icon" size="52"></v-icon>
                    </div>
                    <div class="flex-grow-1 text-center">
                      {{ item.name }}
                    </div>
                  </div>
                </v-card>
              </v-item>
            </div>
          </v-item-group>
          <v-divider vertical class="ml-2"></v-divider>
          <div class="ml-2 w-full">
            <!-- Payment -->
            <div class="flex gap-4">
              <div class="w-64">
                <div class="h-14 flex flex-col">
                  <div class="font-bold">应收金额</div>
                  <div class="flex items-center ml-auto gap-2">
                    <div v-if="cart.totalItemDiscount && cart.totalItemDiscount > 0" class="text-sm">
                      产品已优惠 {{ CNY(cart.totalItemDiscount).format() }}
                    </div>

                    <div class="text-2xl text-red-5">
                      {{ CNY(cart.totalAmount).format() }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-space-evenly mt-2">
                  <div class="kbd_btn money" @click="onRateDiscount(0.7)">7折</div>
                  <div class="kbd_btn money" @click="onRateDiscount(0.8)">8折</div>
                  <div class="kbd_btn money" @click="onRateDiscount(0.9)">9折</div>
                </div>
                <div v-if="payMode == 1" class="flex items-center justify-space-evenly mt-2">
                  <div class="kbd_btn money text-sm h-12" @click="onRoundAmount(roundAll)">
                    抹零:{{ roundAll.format() }}
                  </div>
                </div>
              </div>

              <!-- 现金支付和扫码付款 -->
              <div>
                <div
                  class="border-solid border-1 px-2 flex items-center border-rounded"
                  :class="
                    cashInputSelection == 'actualPay' ? ' bg-neutral-100 border-neutral-100' : 'border-neutral-300'
                  "
                  @click="cashInputSelection = 'actualPay'"
                >
                  <label for="actualPay" class="line-height-14">实收金额：</label>
                  <div>
                    <input
                      v-model="paymentForm.actualPay"
                      id="actualPay"
                      autofocus
                      type="number"
                      step="0.01"
                      class="w-full text-2xl text-right h-14"
                      @focus="(ev) => onInputFocus(ev, 'actualPay')"
                    />
                  </div>
                </div>
                <div class="flex gap-2 items-center mt-2">
                  <div
                    class="border-solid border-1 px-2 flex items-center border-rounded"
                    :class="
                      cashInputSelection == 'discountAmount'
                        ? ' bg-neutral-100 border-neutral-100'
                        : 'border-neutral-300'
                    "
                    @click="cashInputSelection = 'discountAmount'"
                  >
                    <label for="discountAmount" class="line-height-14">优惠</label>
                    <div>
                      <input
                        v-model="paymentForm.discountAmount"
                        id="discountAmount"
                        type="number"
                        step="0.01"
                        class="w-32 text-2xl text-right h-14"
                        @focus="(ev) => onInputFocus(ev, 'discountAmount')"
                      />
                    </div>
                  </div>
                  <div
                    v-if="payMode == 1"
                    class="border-solid border-1 px-2 flex items-center border-rounded"
                    :class="
                      cashInputSelection == 'backChange' ? ' bg-neutral-100 border-neutral-100' : 'border-neutral-300'
                    "
                    @click="cashInputSelection = 'backChange'"
                  >
                    <label for="backChange" class="line-height-14">找零</label>
                    <div>
                      <input
                        v-model="paymentForm.backChange"
                        id="backChange"
                        type="number"
                        step="0.01"
                        class="w-32 text-2xl text-right h-14"
                        @focus="(ev) => onInputFocus(ev, 'backChange')"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="payMode == 1" class="flex items-center mt-2">
                  <div>
                    {{
                      paymentForm.actualPay - paymentForm.discountAmount >= cart.totalAmount ? '应找金额' : '还缺金额'
                    }}：
                  </div>
                  <div class="text-2xl font-bold">
                    <span v-if="paymentForm.actualPay + paymentForm.discountAmount >= cart.totalAmount">
                      {{
                        CNY(paymentForm.actualPay).add(paymentForm.discountAmount).subtract(cart.totalAmount).format()
                      }}
                    </span>
                    <span v-else class="text-red-5">
                      {{
                        CNY(cart.totalAmount)
                          .subtract(paymentForm.discountAmount)
                          .subtract(paymentForm.actualPay)
                          .format()
                      }}
                    </span>
                  </div>
                </div>

                <div v-if="payMode == 2" class="mt-4">
                  <v-btn-toggle v-model="scanPayPlatform" mandatory>
                    <v-btn value="WECHAT">
                      <v-icon start icon="mdi-wechat"></v-icon>
                      微信支付
                    </v-btn>
                    <v-btn value="ALIPAY">
                      <v-icon start icon="mdi-alpha-a-circle"></v-icon>
                      支付宝
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </div>
            </div>
            <!-- 条码支付 -->
            <div v-if="payMode == 0" class="mt-8">
              <div class="h-full flex flex-col justify-center text-center">
                <div class="text-2xl font-bold mb-4">
                  <v-icon :icon="'mdi-wechat'" size="32"></v-icon>
                  微信支付 /
                  <v-icon :icon="'mdi-alpha-a-circle'" size="32"></v-icon>
                  支付宝支付
                </div>

                <div v-if="!weChatPayService.payWaiting.value && !alipayService.payWaiting.value">
                  <div>
                    <input v-model="barcode.code" class="border border-solid text-2xl font-bold h-12 w-96" />
                  </div>
                  <div class="text-neutral-6 mt-2">请扫描顾客二维码</div>
                  <div v-if="payPlatform == 'WECHAT'" class="text-red-5 mt-2">
                    {{ weChatPayService.payErrorMessage.value }}
                  </div>
                  <div v-if="payPlatform == 'ALIPAY'" class="text-red-5 mt-2">
                    {{ alipayService.payErrorMessage.value }}
                  </div>
                </div>

                <div v-if="payPlatform == 'WECHAT' && weChatPayService.payWaiting.value">
                  <div class="text-green-5">微信已扫码</div>
                  <div>
                    <v-progress-circular color="success" indeterminate :size="128" :width="12"></v-progress-circular>
                  </div>
                  <div class="text-neutral-6 mt-2">{{ weChatPayService.payWaitingMessage.value }}</div>
                  <div v-if="weChatPayService.payWaitingCount.value > 0" class="text-neutral-6 mt-2">
                    已等待：{{ weChatPayService.payWaitingCount.value }}次
                    <v-btn
                      v-if="weChatPayService.payWaitingCount.value > 2"
                      color="error"
                      @click="weChatPayService.forceStopWaiting()"
                    >
                      强制停止
                    </v-btn>
                  </div>
                </div>

                <div v-if="payPlatform == 'ALIPAY' && alipayService.payWaiting.value">
                  <div class="text-blue-5">支付宝已扫码</div>
                  <div>
                    <v-progress-circular
                      indeterminate
                      color="blue-lighten-3"
                      :size="128"
                      :width="12"
                    ></v-progress-circular>
                  </div>
                  <div class="text-neutral-6 mt-2">{{ alipayService.payWaitingMessage.value }}</div>
                  <div v-if="alipayService.payWaitingCount.value > 0" class="text-neutral-6 mt-2">
                    已等待：{{ alipayService.payWaitingCount.value }}次
                    <v-btn
                      v-if="alipayService.payWaitingCount.value > 2"
                      color="error"
                      @click="alipayService.forceStopWaiting()"
                    >
                      强制停止
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- 键盘 -->
            <div v-if="payMode == 1 || payMode == 2" class="mt-8">
              <CashKeypad
                @number-click="onNumberClick"
                @money-click="onMoneyClick"
                @dot-click="onDotClick"
                @backspace-click="onBackSpaceClick"
                @confirm-click="payMode == 1 ? onCompleteCashPay() : onCompleteScanPay()"
              />
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="onCancel">
            取消结算
            <template #append>[Esc]</template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped></style>
