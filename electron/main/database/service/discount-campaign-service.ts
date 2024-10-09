import { getDataSource } from '../datasource'
import { DiscountCampaign, DiscountCampaignItem } from '../entity/DiscountCampaign'
import { Product } from '../entity/Product'
import { addPrefixToObject } from '../../../common/interface'
import { ipcMain } from 'electron'
import { DISCOUNT_CAMPAIGN_GET_ITEM_DISCOUNT_INFO } from '../../../common/const'

export const listDiscountCampaign = async () => {
  const repository = (await getDataSource()).getRepository(DiscountCampaign)

  return await repository.findAndCount()
}

export const getItemDiscountInfo = async (productId: number) => {
  const repository = (await getDataSource()).getRepository(DiscountCampaignItem)

  const item: addPrefixToObject<Product, 'product_'> & addPrefixToObject<DiscountCampaign, 'campaign_'>[] =
    await repository
      .createQueryBuilder('item')
      .leftJoinAndSelect(DiscountCampaign, 'campaign', 'item.campaignId = campaign.id')
      .where('campaign.enable = true AND item.productId = :productId', { productId })
      .orderBy('campaign.id', 'DESC')
      .limit(1)
      .getRawOne()
  return item
}

export function initDiscountCampaignService() {
  ipcMain.handle(DISCOUNT_CAMPAIGN_GET_ITEM_DISCOUNT_INFO, (event, args) => getItemDiscountInfo(args))
}
