import { Ref, ref } from 'vue'
import { VDataTableServerUpdateOptions } from '../../electron/common/interface'

export function usePagination<T>(
  fetchFunction: ({ skip, take, order }: { skip: number; take: number; order: any }) => Promise<[T[], number]>,
  likeQuery?: Ref<any>,
  whereQuery?: Ref<any>
) {
  const loading = ref(false)
  const currentPage = ref(0)
  const itemsPerPage = ref(20)
  const totalItems = ref(0)

  const dataList = ref<T[]>()
  let order: any = {}

  const loadItems = (request?: VDataTableServerUpdateOptions) => {
    let like = undefined
    if (likeQuery) {
      like = {}
      Object.keys(likeQuery.value).forEach((key) => {
        like[key] = likeQuery.value[key]
      })
    }
    let where = undefined
    if (whereQuery) {
      where = {}
      Object.keys(whereQuery.value).forEach((key) => {
        where[key] = whereQuery.value[key]
      })
    }
    loading.value = true
    if (request) {
      currentPage.value = request.page
      itemsPerPage.value = request.itemsPerPage
      order = {}
      request.sortBy.forEach((o) => {
        order[o.key] = o.order.toUpperCase()
      })
    }
    fetchFunction({
      skip: (currentPage.value - 1) * itemsPerPage.value,
      take: itemsPerPage.value,
      order,
      like,
      where
    }).then((resp) => {
      totalItems.value = resp[1]
      if (!resp[0]) {
        dataList.value = []
      } else {
        dataList.value = resp[0]
      }
      loading.value = false
    })
  }

  const refresh = () => {
    loadItems()
  }

  return { loading, dataList, currentPage, itemsPerPage, totalItems, loadItems, refresh }
}
