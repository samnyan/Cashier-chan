<script setup lang="ts">
const props = defineProps({
  color: {
    type: String,
    default: () => 'primary'
  },
  icon: {
    type: String,
    default: 'mdi-finance'
  },
  title: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number],
    default: '0'
  }
})
</script>

<template>
  <v-card class="bubble-shape" :class="' bg-' + props.color || ''">
    <v-card-text>
      <div class="flex justify-between">
        <div class="p-2 border-rounded" style="background: rgba(0, 0, 0, 0.3)">
          <slot name="icon">
            <v-icon :icon="icon" />
          </slot>
        </div>
      </div>
      <div class="mt-8">
        <div class="text-3xl font-bold">{{ value }}</div>
        <div class="font-bold mt-2">{{ title }}</div>
      </div>
    </v-card-text>
  </v-card>
</template>
im
<style scoped>
.bubble-shape {
  position: relative;
}

.bubble-shape:before {
  content: '';
  position: absolute;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  top: -125px;
  right: -15px;
  opacity: 0.1;
  z-index: -1;
  background: black;
}

.bubble-shape:after {
  content: '';
  position: absolute;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  top: -85px;
  right: -95px;
  z-index: -1;
  opacity: 0.2;
  background: black;
}
</style>
