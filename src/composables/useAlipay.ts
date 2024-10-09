import { ApiResult } from '../../electron/common/request'
import { AlipayResultDto, PayResponseDto, queryAlipay, requestAlipay } from '../api/payment'
import { AxiosError } from 'axios'
import { showToastError } from '../store/toast'
import { barcode } from '../store/barcode'
import { Ref, ref } from 'vue'
import dayjs from 'dayjs'
import { DEVICE_ID } from '../../electron/common/const'
import { CNY } from '../../electron/common/currencyUtil'
import { useCart } from '../store/cart'

type ResolveFunction = (d: PayResponseDto<AlipayResultDto>) => void
type RejectFunction = (error: any) => void

export function useAlipay(
  getTradeIds: () => { date: dayjs.Dayjs; tradeNum: string },
  form: PaymentForm,
  showCheckout: Ref<boolean>,
  onDirectCodeScan: () => void
) {
  const cart = useCart()

  const currentOutPayNumber = ref<string>()
  const payWaiting = ref(false)
  const payWaitingMessage = ref<string>()
  const payRetryCount = ref(1)
  const payErrorMessage = ref<string>()
  const payWaitingCount = ref(0)

  let reloadTimer: NodeJS.Timeout

  const handleAlipayResponse = (
    data: PayResponseDto<AlipayResultDto>,
    resolve: ResolveFunction,
    reject: RejectFunction
  ) => {
    if (data.success) {
      resolve(data)
      payWaiting.value = false
      return
    }
    if (data.needWaiting) {
      payWaitingCount.value++
      payWaiting.value = true
      payWaitingMessage.value = data.tradeStateDesc
      reloadTimer = setTimeout(() => {
        reloadAlipayResult(resolve, reject)
      }, 1000)
    }
  }

  const handleAlipayError = (error?: AxiosError, reject?: RejectFunction) => {
    if (error?.response) {
      const data = error.response.data as ApiResult<void>
      showToastError(data.message, '错误: ' + data.code)

      payErrorMessage.value = data.message
    }

    payWaiting.value = false
    payRetryCount.value++
    barcode.code = ''
    if (reject) {
      reject(error)
    }
  }

  const scanAlipayCode = (code: string, resolve: ResolveFunction, reject: RejectFunction) => {
    if (payWaiting.value) {
      showToastError('正在处理支付，请不要重复扫码！')
      return
    }
    if (form.actualPay == 0) {
      if (showCheckout.value) {
        showToastError('订单金额未计算，无需支付')
        return
      } else {
        if (confirm('要直接以 ' + CNY(cart.totalAmount).format() + ' 的金额进行支付吗？')) {
          onDirectCodeScan()
          form.actualPay = cart.totalAmount
        } else {
          return
        }
      }
    }
    const ids = getTradeIds()

    payWaiting.value = true
    payWaitingMessage.value = '已扫码，正在处理...'
    payErrorMessage.value = ''

    currentOutPayNumber.value = ids.tradeNum + '' + payRetryCount.value

    requestAlipay({
      authCode: code,
      content: 'CICF小店-潮玩商品',
      deviceInfo: DEVICE_ID,
      totalFee: form.actualPay,
      tradeNum: currentOutPayNumber.value
    })
      .then((resp) => handleAlipayResponse(resp, resolve, reject))
      .catch((error) => handleAlipayError(error, reject))
  }

  const reloadAlipayResult = (resolve: ResolveFunction, reject: RejectFunction) => {
    if (currentOutPayNumber.value) {
      queryAlipay(currentOutPayNumber.value)
        .then((resp) => handleAlipayResponse(resp, resolve, reject))
        .catch((error) => handleAlipayError(error, reject))
    }
  }

  const doScanAlipayCode = (code: string): Promise<PayResponseDto<AlipayResultDto>> => {
    return new Promise<PayResponseDto<AlipayResultDto>>((resolve, reject) => {
      scanAlipayCode(code, resolve, reject)
    })
  }

  const forceStopWaiting = () => {
    if (reloadTimer) {
      clearTimeout(reloadTimer)
    }
    // Force error
    handleAlipayError()
    payErrorMessage.value = '主动取消支付等待！支付有可能会继续完成，请注意不要重复收款。'
  }

  const reset = () => {
    currentOutPayNumber.value = undefined
    payWaiting.value = false
    payWaitingMessage.value = undefined
    payRetryCount.value = 1
    payWaitingCount.value = 0
  }

  return {
    payWaiting,
    payWaitingMessage,
    payRetryCount,
    payErrorMessage,
    payWaitingCount,
    currentOutPayNumber,
    doScanAlipayCode,
    forceStopWaiting,
    reset
  }
}
