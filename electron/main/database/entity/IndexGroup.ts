import { Column, Entity } from 'typeorm'
import { BaseEntity } from './base'

@Entity('index_group')
export class IndexGroup extends BaseEntity {
  @Column('boolean', { default: true })
  show: boolean
  @Column('varchar', { length: 255 })
  name: string
}

@Entity('index_group_item')
export class IndexGroupItem extends BaseEntity {
  @Column('bigint', {})
  groupId: number
  @Column('bigint', {})
  productId: number
  @Column('int', {})
  sortOrder: number
}
