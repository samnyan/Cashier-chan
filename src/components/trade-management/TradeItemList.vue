<script setup lang="ts">
import { CNY } from '../../../electron/common/currencyUtil'
import { ref } from 'vue'
import type { Trade, TradeItem } from '../../../electron/main/database/entity/Trade'

const show = ref(false)
const tradeItemList = ref<TradeItem[]>()
const onShowTradeDetail = (item: Trade) => {
  show.value = true
  window.database.getTradeItem(item.id).then((items) => {
    tradeItemList.value = items
  })
}
const onHideTradeDetail = () => {
  tradeItemList.value = []
}

defineExpose({
  show: onShowTradeDetail
})
</script>

<template>
  <v-dialog v-model="show" max-width="800" @after-leave="onHideTradeDetail">
    <template v-slot:default="{ isActive }">
      <v-card title="订单内容">
        <v-card-text>
          <v-list lines="two">
            <v-list-item title="产品信息">
              <template v-slot:prepend></template>

              <template v-slot:append>
                <div class="flex">
                  <div class="w-42">
                    <div class="text-sm">单价,</div>
                    <div class="text-sm">数量</div>
                  </div>
                  <div class="w-24">总价</div>
                </div>
              </template>
            </v-list-item>
            <v-list-item
              v-for="item in tradeItemList"
              :key="item.productId"
              :subtitle="item.productBarcode"
              :title="item.productName"
            >
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-1">
                  <v-icon color="white">mdi-package-variant</v-icon>
                </v-avatar>
              </template>

              <template v-slot:append>
                <div class="flex text-center items-center">
                  <div class="w-42">
                    <div class="text-sm flex gap-1">
                      <div
                        v-if="item.discountAmount && item.discountAmount > 0"
                        class="text-gray-5 text-decoration-line-through"
                      >
                        {{ CNY(item.productSnapshotPrice).format() }}
                      </div>
                      <div class="text-red-5">
                        {{ CNY(item.productPrice).format() }}
                      </div>
                    </div>
                    <div class="text-sm">{{ item.quantity }} 件</div>
                  </div>
                  <div class="w-42 text-sm font-bold text-red-5">
                    {{ CNY(item.subTotal).format() }}
                  </div>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="关闭" @click="isActive.value = false"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped></style>
