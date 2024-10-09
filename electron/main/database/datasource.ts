import { DataSource } from 'typeorm'
import { Product } from './entity/Product'
import { IndexGroup, IndexGroupItem } from './entity/IndexGroup'
import { Trade, TradeItem } from './entity/Trade'
import { getDatabasePath } from '../config'
import { toastService } from '../service/toast-service'
import { DiscountCampaign, DiscountCampaignItem } from './entity/DiscountCampaign'

export const getDataSource = async () => {
  const AppDataSource = new DataSource({
    type: 'better-sqlite3',
    database: getDatabasePath(),
    entities: [Product, IndexGroup, IndexGroupItem, Trade, TradeItem, DiscountCampaign, DiscountCampaignItem],

    synchronize: true,
    logging: ['error']
  })

  try {
    await AppDataSource.initialize()
    return AppDataSource
  } catch (error) {
    toastService.error(error, '数据库初始化失败')
    console.log(error)
  }
}
