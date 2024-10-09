<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: undefined
  }
})

const error = ref(false)
</script>

<template>
  <div class="flex items-center justify-center overflow-hidden">
    <img v-if="src" :src="src" class="block h-full w-full object-contain" alt="" />
    <div v-if="!src || error" class="block">
      <v-icon icon="mdi-image" color="rgb(100,100,100)"></v-icon>
    </div>
  </div>
</template>

<style scoped></style>
