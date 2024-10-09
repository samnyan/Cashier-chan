<script setup lang="ts">
import { usePagination } from '../../composables/usePagination'
import type { Trade } from '../../../electron/main/database/entity/Trade'
import { onMounted, ref } from 'vue'
import { VDataTableServer } from 'vuetify/components/VDataTable'
import { CNY } from '../../../electron/common/currencyUtil'
import { payPlatformMapping, payStatusMapping, payTypeMapping } from '../../../electron/common/const'
import OrderCheck from '../pos/OrderCheck.vue'
import TradeItemList from './TradeItemList.vue'

const { dataList, loading, totalItems, loadItems } = usePagination<Trade>(window.database.listTrade)

const dataTableRef = ref<InstanceType<typeof VDataTableServer>>()
const tradeItemListRef = ref<InstanceType<typeof TradeItemList>>()

const totalData = ref()
onMounted(() => {
  window.database.getListPageSum().then((resp) => {
    totalData.value = resp
  })
})

const sortBy = ref([{ key: 'tradeNum', order: 'desc' }])

const headers = ref([
  {
    title: '订单编号',
    key: 'tradeNum',
    minWidth: '200px',
    fixed: true
  },
  {
    title: '收银员',
    key: 'cashier',
    minWidth: '100px'
  },
  {
    title: '产品数量',
    key: 'totalQuantity',
    minWidth: '120px',
    align: 'center'
  },
  {
    title: '产品价格',
    key: 'itemPrice',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.itemPrice).format()
  },
  {
    title: '产品原价',
    key: 'itemOriginalPrice',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.itemOriginalPrice).format()
  },
  {
    title: '产品总计打折',
    key: 'itemTotalDiscountAmount',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.itemTotalDiscountAmount).format()
  },
  {
    title: '订单价格',
    key: 'requirePay',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.requirePay).format()
  },
  {
    title: '优惠金额',
    key: 'discountAmount',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.discountAmount).format()
  },
  {
    title: '实际支付',
    key: 'actualPay',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.actualPay).format()
  },
  {
    title: '实找金额',
    key: 'backChange',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.backChange).format()
  },
  {
    title: '退款金额',
    key: 'refundAmount',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.refundAmount).format()
  },
  {
    title: '实际营收',
    key: 'resultAmount',
    minWidth: '120px',
    align: 'end',
    value: (item: Trade) => CNY(item.resultAmount).format()
  },
  {
    title: '支付方式',
    key: 'payType',
    minWidth: '120px',
    value: (item: Trade) => payTypeMapping[item.payType]
  },
  {
    title: '支付状态',
    key: 'payStatus',
    minWidth: '120px',
    value: (item: Trade) => (item.payStatus ? payStatusMapping[item.payStatus].name : ''),
    cellProps: (item: Trade) => ({
      style: item.payStatus ? { color: payStatusMapping[item.payStatus].color } : {}
    })
  },
  {
    title: '支付订单号',
    key: 'payOutTradeNo',
    minWidth: '140px'
  },
  {
    title: '支付平台',
    key: 'payPlatform',
    minWidth: '120px',
    value: (item: Trade) => (item.payPlatform ? payPlatformMapping[item.payPlatform].name : '')
  },
  {
    title: '支付流水号',
    key: 'payTransactionId',
    minWidth: '140px'
  },
  {
    title: '创建时间',
    key: 'creationDate',
    minWidth: '180px'
  },

  { title: '操作', key: 'actions', minWidth: '420px', fixed: true, sortable: false }
])
const orderCheckRef = ref<InstanceType<typeof OrderCheck>>()

const onShowTradeInfo = (item: Trade) => {
  orderCheckRef.value?.check(item.tradeNum)
  orderCheckRef.value?.show()
}
const onShowTradeDetail = (trade: Trade) => {
  tradeItemListRef.value?.show(trade)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div v-if="totalData" class="flex px-2 gap-4 mt-2 mb-2">
      <v-card class="h-full" title="累计营收">
        <v-card-text>
          <div class="text-2xl">{{ CNY(totalData.totalRevenue).format() }}</div>
        </v-card-text>
      </v-card>
      <v-card class="h-full" title="今日营收">
        <v-card-text>
          <div class="text-2xl">{{ CNY(totalData.todayRevenue).format() }}</div>
        </v-card-text>
      </v-card>
      <v-card class="h-full" title="今日订单">
        <v-card-text>
          <div class="text-2xl">
            {{ totalData.todayCount }}
            <span class="text-sm">单</span>
          </div>
        </v-card-text>
      </v-card>
      <v-card class="h-full" title="今日退款">
        <v-card-text>
          <div class="text-2xl">{{ CNY(totalData.todayRefund).format() }}</div>
        </v-card-text>
      </v-card>
      <v-card class="h-full" title="微信收款">
        <v-card-text>
          <div class="text-2xl">{{ CNY(totalData.todayWeChat).add(totalData.todayWeChatScan).format() }}</div>
          <div class="text-sm text-gray-4">其中扫码付{{ CNY(totalData.todayWeChatScan).format() }}</div>
        </v-card-text>
      </v-card>
      <v-card class="h-full" title="支付宝收款">
        <v-card-text>
          <div class="text-2xl">{{ CNY(totalData.todayAlipay).add(totalData.todayAlipayScan).format() }}</div>
          <div class="text-sm text-gray-4">其中扫码付{{ CNY(totalData.todayAlipayScan).format() }}</div>
        </v-card-text>
      </v-card>
      <v-card class="h-full" title="现金收款">
        <v-card-text>
          <div class="text-2xl">{{ CNY(totalData.todayCash).format() }}</div>
        </v-card-text>
      </v-card>
      <v-card class="h-full" title="退款(微信/支付宝)">
        <v-card-text class="flex gap-2">
          <div class="text-2xl">{{ CNY(totalData.todayWeChatRefund).format() }}</div>
          <div class="text-2xl">{{ CNY(totalData.todayAlipayRefund).format() }}</div>
        </v-card-text>
      </v-card>
    </div>
    <v-card class="m-2 h-full">
      <v-data-table-server
        ref="dataTableRef"
        class="h-full"
        fixed-header
        fixed-footer
        v-model:sort-by="sortBy"
        :headers="headers"
        :items="dataList"
        :loading="loading"
        :items-length="totalItems"
        @update:options="loadItems"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn variant="flat" prepend-icon="mdi-file-search" @click="onShowTradeInfo(item)" class="me-2">
            订单详情
          </v-btn>
          <v-btn variant="flat" prepend-icon="mdi-invoice-list-outline" @click="onShowTradeDetail(item)" class="me-2">
            订单产品
          </v-btn>
        </template>
        <template v-slot:no-data>没有数据</template>
      </v-data-table-server>
    </v-card>

    <OrderCheck ref="orderCheckRef" />
    <TradeItemList ref="tradeItemListRef" />
  </div>
</template>

<style scoped></style>
