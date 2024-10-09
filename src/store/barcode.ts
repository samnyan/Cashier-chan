import { reactive } from 'vue'

export const barcode = reactive({
  lock: true,
  code: '',
  orderInput: false,
  requestInput() {
    this.lock = false
  },
  releaseInput() {
    this.lock = true
  }
})
