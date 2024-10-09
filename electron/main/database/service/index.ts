import { BrowserWindow } from 'electron'
import { initProductService } from './product-service'
import { initTradeService } from './trade-service'
import { initIndexGroupService } from './index-group-service'
import { initDiscountCampaignService } from './discount-campaign-service'

export function initDatabaseService(win: BrowserWindow) {
  initProductService()
  initTradeService()
  initIndexGroupService()
  initDiscountCampaignService()
}
