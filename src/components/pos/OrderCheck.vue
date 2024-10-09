<script setup lang="ts">
import { ref } from 'vue'
import { barcode } from '../../store/barcode'
import type { Trade } from '../../../electron/main/database/entity/Trade'
import { CNY } from '../../../electron/common/currencyUtil'
import { payPlatformMapping, payStatusMapping, payTypeMapping } from '../../../electron/common/const'
import { showToastError } from '../../store/toast'
import RefundDialog from './RefundDialog.vue'

const show = ref(false)
const tradeData = ref<Trade>()
const refundDialogRef = ref<InstanceType<typeof RefundDialog>>()
const loading = ref(false)

const init = () => {
  barcode.code = ''
  barcode.orderInput = true
  tradeData.value = undefined
  show.value = true
}

const onClose = () => {
  barcode.orderInput = false
}

const check = async (code: string) => {
  loading.value = true
  try {
    let resp = await window.database.getTradeByPayOutTradeNo(code)
    if (!resp) {
      resp = await window.database.getTradeByTradeNum(code)
    }
    tradeData.value = resp || undefined
  } catch (error) {
    showToastError('查询订单失败')
  } finally {
    loading.value = false
  }
}

const openRefundDialog = () => {
  refundDialogRef.value?.openRefundDialog()
}

defineExpose({
  show: init,
  check
})
</script>

<template>
  <v-dialog v-model="show" max-width="800" @after-leave="onClose">
    <v-card :disabled="loading" :loading="loading" class="mx-auto" max-width="700" min-height="600">
      <template v-slot:loader="{ isActive }">
        <v-progress-linear :active="isActive" color="deep-purple" height="4" indeterminate></v-progress-linear>
      </template>

      <v-card-title class="text-h5 font-weight-bold">订单详情</v-card-title>

      <v-card-text>
        <slot></slot>
        <v-row v-if="tradeData">
          <v-col cols="12" md="6">
            <v-card-subtitle class="text-h6 font-weight-bold pb-0">订单信息</v-card-subtitle>
            <v-list dense>
              <v-list-item>
                <v-list-item-title>订单号：</v-list-item-title>
                <v-list-item-subtitle>{{ tradeData.tradeNum }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>产品价格：</v-list-item-title>
                <v-list-item-subtitle>{{ CNY(tradeData.itemPrice).format() }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>订单价格：</v-list-item-title>
                <v-list-item-subtitle>{{ CNY(tradeData.requirePay).format() }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>实际支付：</v-list-item-title>
                <v-list-item-subtitle>{{ CNY(tradeData.actualPay).format() }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="6">
            <v-card-subtitle class="text-h6 font-weight-bold pb-0">支付信息</v-card-subtitle>
            <v-list dense>
              <v-list-item>
                <v-list-item-title>支付方式：</v-list-item-title>
                <v-list-item-subtitle>{{ payTypeMapping[tradeData.payType] }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>支付平台：</v-list-item-title>
                <v-list-item-subtitle>
                  {{ tradeData.payPlatform && payPlatformMapping[tradeData.payPlatform]?.name }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>支付订单号：</v-list-item-title>
                <v-list-item-subtitle>{{ tradeData.payOutTradeNo }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>支付流水号：</v-list-item-title>
                <v-list-item-subtitle class="w-92">{{ tradeData.payTransactionId }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>支付状态：</v-list-item-title>
                <v-list-item-subtitle
                  v-if="tradeData.payStatus"
                  :style="{ color: payStatusMapping[tradeData.payStatus].color }"
                >
                  {{ payStatusMapping[tradeData.payStatus].name }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="error" @click="openRefundDialog" :disabled="!tradeData">发起退款</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="show = false">
          关闭
          <template #append>[Esc]</template>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <RefundDialog v-if="tradeData" ref="refundDialogRef" :trade-data="tradeData" />
</template>

<style scoped></style>
