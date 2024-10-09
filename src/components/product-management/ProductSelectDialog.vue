<script setup lang="ts">
import { ref } from 'vue'
import ProductList from './ProductList.vue'

const show = ref(false)
const selectList = ref()

const emits = defineEmits(['submit'])

const onSelectionChange = (list) => {
  selectList.value = list
}

const onShow = () => {
  show.value = true
}

const onConfirm = () => {
  show.value = false
  emits('submit', selectList.value)
}

defineExpose({
  show: onShow
})
</script>

<template>
  <v-dialog v-model="show">
    <v-card>
      <div class="p-2" style="height: calc(100vh - 200px)">
        <ProductList ref="productList" dialog @selection-change="onSelectionChange" />
      </div>
      <v-card-actions>
        <v-btn color="error" @click="show = false">取消</v-btn>
        <v-btn color="primary" @click="onConfirm">确认</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
