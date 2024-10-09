<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Product } from '../../../electron/main/database/entity/Product'
import { useCart } from '../../store/cart'
import type { IndexGroup } from '../../../electron/main/database/entity/IndexGroup'
import Image from '../common/Image.vue'
import { addPrefixToObject } from '../../../electron/common/types/common'

const emits = defineEmits(['wechatCode'])

const cart = useCart()

const currentTab = ref()
const list = ref<addPrefixToObject<Product, 'product_'>[]>([])

const tabGroup = ref<IndexGroup[]>([])

const onProductClick = (item: (typeof list.value)[0]) => {
  handleAddProduct({
    id: item.product_id,
    type: item.product_type,
    externalId: item.product_externalId,
    name: item.product_name,
    imgUrl: item.product_imgUrl,
    category: item.product_category,
    barcode: item.product_barcode,
    price: item.product_price
  })
}

onMounted(() => {
  window.database.listHomeIndexGroup().then((resp) => {
    tabGroup.value = resp[0]
    if (tabGroup.value[0]) {
      currentTab.value = tabGroup.value[0].id
      loadProduct()
    }
  })
})

const loadProduct = () => {
  window.database.getIndexGroupDetail(currentTab.value).then((resp) => {
    list.value = resp[0] as any
  })
}

const onProductUpdate = ({ barcode, product }: { barcode: string; product?: Product }) => {
  if (product) {
    handleAddProduct(product)
  } else {
    showProductError(barcode)
  }
}

const handleAddProduct = (product: Product) => {
  cart.addProduct(product)
}

const errorText = ref<string>()
const showProductError = (barcode: string) => {
  errorText.value = `没有找到条码是 ${barcode} 的商品`
  setTimeout(() => {
    errorText.value = undefined
  }, 3000)
}

defineExpose({
  onProductUpdate
})
</script>

<template>
  <div class="h-full w-full relative box-border px-2 flex flex-col">
    <div class="flex-shrink-0">
      <slot></slot>
      <v-tabs v-model="currentTab" class="mb-2">
        <v-tab v-for="item of tabGroup" :value="item.id">{{ item.name }}</v-tab>
      </v-tabs>
    </div>
    <div class="flex-grow overflow-y-auto better_scrollbar">
      <div class="grid grid-cols-12 gap-4">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="xl:col-span-3 lg:col-span-4 md:col-span-6 col-span-12 p-2 border border-solid border-neutral-200 bg-neutral-0 rounded flex cursor-pointer hover:bg-neutral-100"
          @click="onProductClick(item)"
        >
          <div class="text-center">
            <Image class="rounded w-24 h-24 bg-neutral-50" :src="item.product_imgUrl"></Image>
            <!--            <img class="rounded w-24 h-24 bg-neutral-50" :src="item.product_imgUrl" :alt="item.product_name" />-->
          </div>
          <div class="pl-2 flex flex-col relative w-full">
            <div>
              <div class="text-sm">{{ item.product_name }}</div>
            </div>
            <div class="mt-a">
              <span class="text-xl font-semibold">￥{{ item.product_price }}</span>
            </div>

            <div class="absolute right-0 bottom-0">
              <v-chip>
                {{ item.product_category }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-shrink-0">
      <v-alert v-if="cart.cartSuccessText" :text="cart.cartSuccessText" type="success"></v-alert>
      <v-alert v-if="errorText" :text="errorText" type="error"></v-alert>
    </div>
  </div>
</template>

<style scoped></style>
