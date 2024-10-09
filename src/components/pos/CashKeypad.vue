<script setup lang="ts">
const emit = defineEmits<{
  (e: 'number-click', value: number): void
  (e: 'money-click', value: number): void
  (e: 'dot-click'): void
  (e: 'backspace-click'): void
  (e: 'confirm-click'): void
}>()

const onNumberClick = (num: number) => emit('number-click', num)
const onMoneyClick = (amount: number) => emit('money-click', amount)
const onDotClick = () => emit('dot-click')
const onBackSpaceClick = () => emit('backspace-click')
const onConfirmClick = () => emit('confirm-click')
</script>

<template>
  <div class="grid grid-rows-4 grid-flow-col gap-4">
    <div class="kbd_btn money" @click="onMoneyClick(100)">￥100</div>
    <div class="kbd_btn money" @click="onMoneyClick(50)">￥50</div>
    <div class="kbd_btn money" @click="onMoneyClick(20)">￥20</div>
    <div class="kbd_btn money" @click="onMoneyClick(10)">￥10</div>
    <div class="kbd_btn" @click="onNumberClick(1)">1</div>
    <div class="kbd_btn" @click="onNumberClick(4)">4</div>
    <div class="kbd_btn" @click="onNumberClick(7)">7</div>
    <div class="kbd_btn" @click="onNumberClick(0)">0</div>
    <div class="kbd_btn" @click="onNumberClick(2)">2</div>
    <div class="kbd_btn" @click="onNumberClick(5)">5</div>
    <div class="kbd_btn" @click="onNumberClick(8)">8</div>
    <div class="kbd_btn" @click="onNumberClick(0)">00</div>
    <div class="kbd_btn" @click="onNumberClick(3)">3</div>
    <div class="kbd_btn" @click="onNumberClick(6)">6</div>
    <div class="kbd_btn" @click="onNumberClick(9)">9</div>
    <div class="kbd_btn" @click="onDotClick()">·</div>
    <div class="kbd_btn" @click="onBackSpaceClick()">←</div>
    <div class="row-span-3 kbd_btn confirm" @click="onConfirmClick">结算</div>
  </div>
</template>

<style scoped></style>
