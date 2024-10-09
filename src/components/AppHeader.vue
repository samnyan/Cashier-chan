<script setup lang="ts">
import { Ref, ref } from 'vue'
import { appTemp } from '../store/appTemp'

import { useUserStore } from '../store/user'
import { barcode } from '../store/barcode'

const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: ''
})

const routes = ref(['收银台'])
const drawer = ref(false)
const menu = ref([
  {
    title: '收银台',
    value: 'home',
    props: {
      prependIcon: 'mdi-cash-register'
    }
  },
  {
    title: '产品管理',
    value: 'product',
    props: {
      prependIcon: 'mdi-list-box-outline'
    }
  },
  {
    title: '首页产品管理',
    value: 'indexGroup',
    props: {
      prependIcon: 'mdi-home-edit'
    }
  },
  {
    title: '订单查询',
    value: 'trade',
    props: {
      prependIcon: 'mdi-finance'
    }
  },
  {
    title: '数据统计',
    value: 'statistic',
    props: {
      prependIcon: 'mdi-finance'
    }
  }
])

const onTabChange = (value: any) => {
  appTemp.tab = value.id
  const idx = menu.value.findIndex((item) => item.value === value.id)
  if (idx >= 0) {
    routes.value = [menu.value[idx].title]
  }
  drawer.value = false
}

const onShowLogin = () => {
  barcode.requestInput()
}
const onHideLogin = () => {
  barcode.releaseInput()
}

const onLoginClick = (dialogRef: Ref<boolean>) => {
  userStore
    .login(loginForm.value.username, loginForm.value.password)
    .then(() => {
      dialogRef.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}

const onLogoutClick = (dialogRef: Ref<boolean>) => {
  userStore.logout()

  dialogRef.value = false
}
</script>

<template>
  <v-app-bar>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-app-bar-title>
      <div class="flex items-center">
        <img class="h-12" src="" alt="Logo" />
        <v-breadcrumbs :items="routes"></v-breadcrumbs>
      </div>
    </v-app-bar-title>

    <v-dialog max-width="500" @after-leave="onHideLogin">
      <template #activator="{ props }">
        <v-btn icon v-bind="props" @click="onShowLogin">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>

      <template #default="{ isActive }">
        <v-card v-if="!userStore.userInfo" title="登录">
          <v-card-text>
            <v-text-field v-model="loginForm.username" label="用户名" />
            <v-text-field v-model="loginForm.password" label="密码" type="password" />
          </v-card-text>
          <v-card-actions>
            <v-btn @click="isActive.value = false">取消</v-btn>
            <v-btn color="primary" @click="onLoginClick(isActive)">登录</v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else title="退出登录">
          <v-card-text>你好，{{ userStore.userInfo.username }}</v-card-text>
          <v-card-actions>
            <v-btn @click="isActive.value = false">取消</v-btn>
            <v-btn color="primary" @click="onLogoutClick(isActive)">退出登录</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary>
    <v-list :activated="appTemp.tab" :items="menu" nav @click:select="onTabChange"></v-list>
  </v-navigation-drawer>
</template>

<style scoped></style>
