<template>
  <div class="toast-container">
    <transition-group name="toast">
      <v-alert
        v-for="(toast, index) in toasts"
        :key="toast.messageId"
        :title="toast.title"
        :type="toast.type"
        :value="true"
        class="toast"
        variant="flat"
        elevation="5"
        closable
      >
        {{ toast.message }}
      </v-alert>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { toasts } from '../../store/toast'
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 3000; /* 确保Toast显示在导航栏之上 */
}

.toast {
  min-width: 300px;
}

.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
  position: absolute;
}
.toast-leave-active {
  position: absolute;
}
</style>
