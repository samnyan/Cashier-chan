<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Product } from '../../../electron/main/database/entity/Product'
import { VDataTableServer } from 'vuetify/components/VDataTable'
import { mergeReactive } from '../../utils/objUtil'
import { usePagination } from '../../composables/usePagination'
import { showToastSuccess } from '../../store/toast'

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false
  }
})

const selected = ref<Product[]>([])

const emits = defineEmits(['selection-change'])

watch(
  () => selected.value,
  () => {
    emits('selection-change', selected.value)
  }
)

const searchField = ref({
  name: '',
  barcode: ''
})

const { dataList, loading, totalItems, loadItems, refresh } = usePagination(window.database.listProduct, searchField)

watch(
  () => searchField.value,
  () => {
    refresh()
  },
  { deep: true }
)

const headers = ref([
  {
    title: '产品名称',
    key: 'name',
    minWidth: '120px'
  },
  {
    title: '产品图片',
    key: 'imgUrl',
    width: '120px'
  },
  {
    title: '价格',
    key: 'price',
    width: '120px'
  },
  {
    title: '分类',
    key: 'category',
    width: '120px'
  },
  {
    title: '产品条码',
    key: 'barcode',
    width: '180px'
  },

  { title: '操作', key: 'actions', width: '220px', sortable: false }
])

const editProductDialog = ref(false)

const productForm = reactive<Partial<Product>>({
  id: undefined,
  type: 1,
  externalId: undefined,
  name: '',
  imgUrl: '',
  category: '',
  barcode: '',
  price: 0
})
const submitted = ref(false)

function resetForm() {
  productForm.id = undefined
  productForm.type = 1
  productForm.externalId = undefined
  productForm.name = ''
  productForm.imgUrl = ''
  productForm.category = ''
  productForm.barcode = ''
  productForm.price = 0
}

function onCreateClick() {
  resetForm()
  submitted.value = false
}

function hideDialog() {
  editProductDialog.value = false
  submitted.value = false
}

function saveProduct() {
  submitted.value = true

  window.database
    .updateProduct(JSON.stringify(productForm))
    .then(() => {
      showToastSuccess('保存成功！')
      editProductDialog.value = false
      resetForm()
      loadItems()
    })
    .catch((error) => {
      console.log(error)
      showToastSuccess('保存失败！')
    })
}

function onEditClick(prod: Product) {
  mergeReactive(productForm, prod)
  editProductDialog.value = true
}

function onDeleteClick(prod: Product) {
  if (confirm(`确定要删除 ${prod.name} 吗？`)) {
    window.database.deleteProduct(prod.id).then(() => {
      loadItems()
    })
  }
}
</script>

<template>
  <div class="flex flex-col h-full w-full box-border">
    <div class="mb-2 flex items-center gap-2">
      <template v-if="!dialog">
        <v-icon icon="mdi-list-box-outline"></v-icon>
        <div>产品管理</div>

        <v-btn id="create-btn-target" color="primary" @click="onCreateClick">新建产品</v-btn>
      </template>

      <v-spacer></v-spacer>

      <v-text-field
        v-model="searchField.name"
        density="compact"
        label="搜索名称"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-text-field>
      <v-text-field
        v-model="searchField.barcode"
        density="compact"
        label="搜索条码"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-text-field>
    </div>
    <v-card class="h-full w-full">
      <v-data-table-server
        class="h-full w-full"
        v-model="selected"
        return-object
        fixed-header
        fixed-footer
        :show-select="props.dialog"
        :headers="headers"
        :items="dataList"
        :loading="loading"
        :items-length="totalItems"
        @update:options="loadItems"
      >
        <template v-slot:item.imgUrl="{ value }">
          <div class="h-24 w-24">
            <img v-if="value" :src="value" :alt="value.name" class="h-full w-full p-1 object-contain rounded" />
          </div>
        </template>

        <template v-slot:item.price="{ value }">￥{{ value }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn variant="flat" prepend-icon="mdi-pencil" @click="onEditClick(item)" class="me-2">编辑</v-btn>
          <v-btn variant="outlined" color="error" prepend-icon="mdi-delete-outline" @click="onDeleteClick(item)">
            删除
          </v-btn>
        </template>
        <template v-slot:no-data>没有数据</template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="editProductDialog" activator="#create-btn-target" max-width="500px">
      <v-card title="编辑产品">
        <v-card-text v-if="productForm">
          <v-form>
            <v-text-field v-model="productForm.name" label="产品名称"></v-text-field>
            <v-text-field v-model="productForm.category" label="分类"></v-text-field>
            <v-text-field v-model="productForm.barcode" label="产品条码"></v-text-field>
            <v-text-field v-model="productForm.price" label="价格"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="hideDialog">取消</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveProduct">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped></style>
