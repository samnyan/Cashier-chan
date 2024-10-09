import { Column, Entity } from 'typeorm'
import { BaseEntity } from './base'

@Entity('discount_campaign')
export class DiscountCampaign extends BaseEntity {
  @Column('boolean', { default: true })
  enable: boolean
  @Column('varchar', { length: 255 })
  name: string
  @Column('decimal', { precision: 10, scale: 2 })
  discountRate: number
}

@Entity('discount_campaign_item')
export class DiscountCampaignItem extends BaseEntity {
  @Column('bigint', {})
  campaignId: number
  @Column('bigint', {})
  productId: number
}
