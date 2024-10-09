<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Trade } from '../../../electron/main/database/entity/Trade'
import { refundAlipay, refundWeChat } from '../../api/payment'
import { showToastError, showToastSuccess } from '../../store/toast'
import { barcode } from '../../store/barcode'
import { AxiosError } from 'axios'

const props = defineProps<{
  tradeData: Trade
}>()

const show = ref(false)
const showPasswordDialog = ref(false)
const password = ref('')
const passwordInput = ref<HTMLInputElement | null>(null)
const REFUND_PASSWORD = '12345678'

const refundState = reactive({
  working: false,
  value: 0,
  reason: '用户申请退款'
})

const openRefundDialog = () => {
  refundState.value = props.tradeData.actualPay
  show.value = true
  barcode.requestInput()
}

const verifyPassword = () => {
  if (password.value === REFUND_PASSWORD) {
    showPasswordDialog.value = false
    password.value = ''
    proceedWithRefund()
  } else {
    showToastError('密码错误')
    password.value = ''
  }
}

const onRefundClick = () => {
  showPasswordDialog.value = true
  setTimeout(() => {
    passwordInput.value?.focus()
  }, 100)
}

const proceedWithRefund = async () => {
  const t = props.tradeData

  if (t.payType == 2) {
    await window.database.setTradeStatusById(t.id, 'REFUND')
    await window.database.addTradeRefundAmount(t.id, refundState.value)
    showToastSuccess('退款处理已完成！')
    return
  }

  if (t.payType == 3) {
    await window.database.setTradeStatusById(t.id, 'REFUND')
    await window.database.addTradeRefundAmount(t.id, refundState.value)
    showToastSuccess('退款处理已完成！请在对应支付平台上完成退款')
    return
  }

  if (!t.payOutTradeNo) {
    showToastError('没有交易订单号！')
    return
  }

  if (t.payType != 1) {
    showToastError('非在线支付无法退款！')
    return
  }

  refundState.working = true

  try {
    if (t.payPlatform == 'ALIPAY') {
      await refundAlipay({
        outTradeNo: t.payOutTradeNo,
        outRequestNo: t.payOutTradeNo,
        refundAmount: refundState.value,
        refundReason: refundState.reason
      })
      await window.database.setTradeStatus(t.payOutTradeNo, 'TRADE_CLOSED')
      await window.database.addTradeRefundAmount(t.id, refundState.value)
    } else if (t.payPlatform == 'WECHAT') {
      await refundWeChat({
        outTradeNo: t.payOutTradeNo,
        outRefundNo: t.payOutTradeNo,
        refundFee: refundState.value,
        refundDesc: refundState.reason
      })
      await window.database.setTradeStatus(t.payOutTradeNo, 'REFUND')
      await window.database.addTradeRefundAmount(t.id, refundState.value)
    } else {
      showToastError('不支持的退款平台')
      return
    }
    showToastSuccess('已发起退款申请！')
    show.value = false
  } catch (error) {
    showToastError(error instanceof AxiosError ? error.response?.data?.message || error.message : '退款失败')
  } finally {
    refundState.working = false
  }
}

defineExpose({
  openRefundDialog
})
</script>

<template>
  <v-dialog v-model="show" width="500" persistent @after-leave="barcode.releaseInput()">
    <v-card>
      <v-card-title>退款</v-card-title>
      <v-card-text>
        <v-text-field v-model="refundState.value" label="退款金额" type="number" prefix="¥" class="mt-4"></v-text-field>
        <v-text-field v-model="refundState.reason" label="退款原因" class="mt-4"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="default" @click="show = false">取消</v-btn>
        <v-btn color="error" @click="onRefundClick" :loading="refundState.working">确认退款</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showPasswordDialog" width="400" persistent>
    <v-card>
      <v-card-title>请输入退款密码</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="password"
          label="密码"
          type="password"
          @keyup.enter="verifyPassword"
          ref="passwordInput"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="default" @click="showPasswordDialog = false">取消</v-btn>
        <v-btn color="primary" @click="verifyPassword">确认</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
