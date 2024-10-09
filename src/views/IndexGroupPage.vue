<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { IndexGroup, IndexGroupItem } from '../../electron/main/database/entity/IndexGroup'
import { mergeReactive } from '../utils/objUtil'
import { VDataTableServer } from 'vuetify/components/VDataTable'
import { usePagination } from '../composables/usePagination'
import ProductSelectDialog from '../components/product-management/ProductSelectDialog.vue'
import type { Product } from '../../electron/main/database/entity/Product'

const currentTab = ref()
const tabGroup = ref<IndexGroup[]>([])
const productSelectDialogRef = ref<InstanceType<typeof ProductSelectDialog>>()

const searchForm = ref({
  groupId: -1
})

const { dataList, loading, totalItems, loadItems, refresh } = usePagination(
  window.database.listIndexGroupItem,
  undefined,
  searchForm
)

const headers = ref([
  {
    title: 'ID',
    key: 'item_id',
    width: '80px'
  },
  {
    title: '排序',
    key: 'item_sortOrder',
    width: '80px'
  },
  {
    title: '产品ID',
    key: 'product_id',
    width: '80px'
  },
  {
    title: '产品名称',
    key: 'product_name',
    width: '120px'
  },
  {
    title: '产品图片',
    key: 'product_imgUrl',
    width: '120px'
  },
  {
    title: '价格',
    key: 'product_price',
    width: '120px'
  },
  {
    title: '分类',
    key: 'product_category',
    width: '120px'
  },
  {
    title: '产品条码',
    key: 'product_barcode',
    width: '180px'
  },

  { title: '操作', key: 'actions', width: '220px', sortable: false }
])

onMounted(() => {
  loadGroup()
})

const loadGroup = () => {
  window.database.listIndexGroup().then((resp) => {
    tabGroup.value = resp[0]
    const first = tabGroup.value[0]
    if (first) {
      searchForm.value.groupId = first.id
      refresh()
    }
  })
}

const onTabChange = (ev) => {
  console.log(ev)
}

const onAddProductClick = () => {
  productSelectDialogRef.value?.show()
}
const onSelectSubmit = async (items: Product[]) => {
  for (let item of items) {
    const i: IndexGroupItem = {
      id: -1,
      groupId: searchForm.value.groupId,
      productId: item.id,
      sortOrder: 999
    }
    await window.database.updateIndexGroupItem(JSON.stringify(i))
  }
  refresh()
}

const showGroupDialog = ref(false)
const groupEditForm = reactive<Partial<IndexGroup>>({
  id: -1,
  name: '',
  show: true
})
const resetForm = () => {
  groupEditForm.id = -1
  groupEditForm.name = ''
  groupEditForm.show = true
}
const onCreateGroupClick = () => {
  resetForm()
  showGroupDialog.value = true
}
const onEditGroupClick = (item: IndexGroup) => {
  resetForm()
  showGroupDialog.value = true
  mergeReactive(groupEditForm, item)
}

const onGroupSubmit = () => {
  showGroupDialog.value = false
  window.database.updateIndexGroup(JSON.stringify(groupEditForm)).then(() => {
    loadGroup()
  })
}

const showGroupItemDialog = ref(false)
const groupItemEditForm = reactive<Partial<IndexGroupItem>>({
  id: -1,
  groupId: -1,
  productId: -1,
  sortOrder: -1
})
const resetItemForm = () => {
  groupItemEditForm.id = -1
  groupItemEditForm.groupId = -1
  groupItemEditForm.productId = -1
  groupItemEditForm.sortOrder = -1
}
const onEditClick = (item) => {
  resetItemForm()
  groupItemEditForm.id = item.item_id
  groupItemEditForm.groupId = item.item_groupId
  groupItemEditForm.productId = item.item_productId
  groupItemEditForm.sortOrder = item.item_sortOrder
  showGroupItemDialog.value = true
}

const onGroupItemSubmit = () => {
  showGroupItemDialog.value = false
  window.database.updateIndexGroupItem(JSON.stringify(groupItemEditForm)).then(() => {
    loadGroup()
  })
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div>
      <v-tabs v-model="currentTab" @change="onTabChange">
        <v-tab v-for="item of tabGroup" :value="item.id">
          {{ item.name }}
          <v-icon v-if="item.show" icon="mdi-eye" />
          <v-btn icon="mdi-pen" variant="text" @click="onEditGroupClick(item)"></v-btn>
        </v-tab>
        <v-tab @click="onCreateGroupClick()">
          创建
          <v-icon icon="mdi-plus" />
        </v-tab>
      </v-tabs>
    </div>

    <div class="m-2">
      <v-btn color="primary" @click="onAddProductClick">添加产品</v-btn>
      <ProductSelectDialog ref="productSelectDialogRef" @submit="onSelectSubmit" />
    </div>
    <v-card class="m-2 h-full">
      <v-data-table-server
        class="h-full"
        fixed-header
        fixed-footer
        :headers="headers"
        :items="dataList"
        :loading="loading"
        :items-length="totalItems"
        @update:options="loadItems"
      >
        <template v-slot:item.product_imgUrl="{ value }">
          <div class="h-32 w-32">
            <img v-if="value" :src="value" :alt="value.name" class="h-full w-full object-contain rounded" />
          </div>
        </template>

        <template v-slot:item.product_price="{ value }">￥{{ value }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn variant="flat" prepend-icon="mdi-pencil" @click="onEditClick(item)" class="me-2">编辑</v-btn>
          <v-btn variant="outlined" color="error" prepend-icon="mdi-delete-outline" @click="onDeleteClick(item)">
            删除
          </v-btn>
        </template>
        <template v-slot:no-data>没有数据</template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="showGroupDialog" width="400">
      <v-form @submit.prevent="onGroupSubmit">
        <v-card title="修改分组">
          <v-card-text>
            <v-text-field v-model="groupEditForm.name" label="分组名" />
            <v-switch v-model="groupEditForm.show" color="primary" label="是否显示"></v-switch>
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="showGroupItemDialog = false">取消</v-btn>
            <v-btn color="primary" type="submit">提交</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="showGroupItemDialog" width="400">
      <v-form @submit.prevent="onGroupItemSubmit">
        <v-card title="修改分组">
          <v-card-text>
            <v-text-field v-model="groupItemEditForm.groupId" label="分组ID" />
            <v-text-field v-model="groupItemEditForm.productId" label="产品ID" />
            <v-text-field v-model="groupItemEditForm.sortOrder" label="排序" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="showGroupItemDialog = false">取消</v-btn>
            <v-btn color="primary" type="submit">提交</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<style scoped></style>
