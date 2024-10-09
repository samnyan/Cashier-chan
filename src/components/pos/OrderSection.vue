<script setup lang="ts">
import { useCart } from '../../store/cart'
import { CNY } from '../../../electron/common/currencyUtil'
import { ref } from 'vue'
import Image from '../common/Image.vue'

const cart = useCart()

const orderMenu = ref([
  {
    title: '清空订单',
    icon: 'mdi-trash-can-outline',
    callback: () => {
      if (confirm('确定要清空该订单吗？')) {
        cart.clearCart()
      }
    }
  }
])

const emits = defineEmits(['checkout'])

const onCheckoutClick = () => {
  emits('checkout')
}
const onRemoveItem = (item, index: number) => {
  if (confirm('确定要删除 【' + item.product.name + '】 吗？')) {
    cart.removeProduct(index)
  }
}
</script>

<template>
  <div class="flex flex-col h-full p-2 relative">
    <div class="font-bold py-2 border-b border-b-solid border-b-neutral-200 text-neutral-600 flex items-center">
      <div class="text-black flex items-center">
        <div>订单</div>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props"></v-btn>
          </template>

          <v-list activatable>
            <v-list-item
              v-for="(item, index) in orderMenu"
              :key="index"
              :value="index"
              :title="item.title"
              :prepend-icon="item.icon"
              @click="item.callback"
            ></v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div class="text-sm ml-4">产品单价</div>
      <div class="text-sm ml-auto mr-8">数量</div>
      <div class="text-sm mr-2">单品小计</div>
    </div>
    <div class="h-full overflow-y-scroll better_scrollbar pb-12">
      <div v-for="(item, index) in cart.cartList" :key="index">
        <div class="flex items-center py-2" :class="{ 'border-t border-t-solid border-t-neutral-200': index !== 0 }">
          <div class="w-14 h-14 text-center">
            <Image class="block rounded w-12 h-12" :src="item.product.imgUrl" />

            <span class="text-xs">{{ item.product.category }}</span>
          </div>
          <div class="w-full ml-1">
            <div class="break-all h-14">
              <div class="max-h-12 overflow-hidden text-ellipsis">
                {{ item.product.name }}
              </div>
              <div class="flex items-center gap-1">
                <div
                  v-if="item.discountAmount && item.discountAmount > 0"
                  class="text-gray-5 text-decoration-line-through"
                  style="font-size: 12px"
                >
                  {{ CNY(item.product.price).format() }}
                </div>
                <div class="font-bold" :class="{ 'text-red-5': item.discountAmount && item.discountAmount > 0 }">
                  {{ CNY(item.itemPrice).format() }}
                </div>
              </div>
            </div>
          </div>
          <div class="w-14 flex flex-col items-center">
            <v-btn
              density="compact"
              variant="flat"
              icon="mdi-plus"
              @click="cart.setQuantity(index, item.quantity + 1)"
            ></v-btn>
            <div>
              {{ item.quantity }}
            </div>

            <v-btn
              density="compact"
              variant="flat"
              icon="mdi-minus"
              @click="cart.setQuantity(index, item.quantity - 1)"
            ></v-btn>
          </div>
          <div class="w-38 flex flex-col items-end">
            <span class="text-lg font-semibold mr-1">￥{{ item.subTotal }}</span>
            <div class="flex flex-row-reverse md:flex-row gap-2">
              <v-btn
                variant="flat"
                density="comfortable"
                color="error"
                icon="mdi-delete-outline"
                @click="onRemoveItem(item, index)"
              ></v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-a">
      <div class="flex justify-between font-bold">
        <div>
          <div class="text-red-5">
            总金额：
            <span class="text-lg">{{ CNY(cart.totalAmount).format() }}</span>
          </div>
          <div v-if="cart.totalItemDiscount && cart.totalItemDiscount > 0" class="text-gray-5 text-sm">
            已优惠：
            <span>{{ CNY(cart.totalItemDiscount).format() }}</span>
          </div>
        </div>
        <div>总件数：{{ cart.totalQuantity }}</div>
      </div>
      <v-btn class="w-full" size="large" color="success" @click="onCheckoutClick">
        结算
        <template #append>[空格键]</template>
      </v-btn>
    </div>
  </div>
</template>

<style scoped></style>
