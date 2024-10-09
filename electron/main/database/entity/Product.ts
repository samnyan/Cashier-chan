import { Column, Entity } from 'typeorm'
import { BaseEntity } from './base'

@Entity('product')
export class Product extends BaseEntity {
  @Column('int', { default: 1 })
  type: number
  @Column('bigint', { nullable: true })
  externalId: number
  @Column('varchar', { length: 255 })
  name: string
  @Column('varchar', { length: 255, nullable: true })
  imgUrl?: string
  @Column('varchar', { length: 255, nullable: true })
  category?: string
  @Column('varchar', { length: 50, nullable: true })
  barcode?: string
  @Column('decimal', { precision: 10, scale: 2 })
  price: number
}
