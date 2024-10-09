<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { barcode } from '../../store/barcode'
import scanAudio from '../../assets/sound/scan.mp3'
import { useSound } from '@vueuse/sound'

const scanSound = useSound(scanAudio)

const emits = defineEmits(['update', 'wechatCode', 'alipayCode', 'order'])
const eanCodeLength = 13

const weChatCodeRule = /^1[0-5]\d{16}$/
const alipayCodeRule = /^2[5-8]\d{14,22}/

async function onValueChange() {}

function clearInput() {
  barcode.code = ''
}

async function commitValue() {
  const value = barcode.code.trim()
  if (barcode.orderInput) {
    emits('order', value)
    return
  }
  if (value.length == eanCodeLength) {
    const item = await window.database.findProductByBarcode(value)
    if (item != null) {
      emits('update', { barcode: value, product: item })
    } else {
      emits('update', { barcode: value, product: null })
    }
    clearInput()
  } else if (weChatCodeRule.test(value)) {
    emits('wechatCode', value)
    scanSound.play()
    clearInput()
  } else if (alipayCodeRule.test(value)) {
    emits('alipayCode', value)
    scanSound.play()
    clearInput()
  }
}

onKeyStroke(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], (e) => {
  if (!barcode.lock) {
    return
  }
  e.preventDefault()
  barcode.code += e.key
  onValueChange()
})

onKeyStroke(['Delete'], (e) => {
  if (!barcode.lock) {
    return
  }
  e.preventDefault()
  clearInput()
})

onKeyStroke(['Backspace'], (e) => {
  if (!barcode.lock) {
    return
  }
  e.preventDefault()
  if (barcode.code && barcode.code.length > 0) {
    barcode.code = barcode.code.slice(0, -1)
  }
})
onKeyStroke(['Tab'], (e) => {
  e.preventDefault()
  commitValue()
  clearInput()
})
</script>

<template>
  <div class="flex gap-2 items-center text-2xl font-weight-bold w-fit">
    <div class="w-32 text-center">条码输入</div>
    <div class="w-72">
      <input v-model="barcode.code" class="border border-solid h-full w-full" @input="onValueChange" />
    </div>
    <div>
      <v-btn variant="flat" color="primary" @click="commitValue()">
        提交
        <template #append>TAB</template>
      </v-btn>
      <v-btn class="ml-1" variant="flat" color="error" @click="clearInput()">
        清除
        <template #append>DEL</template>
      </v-btn>
    </div>
  </div>
</template>

<style scoped></style>
