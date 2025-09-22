import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class RestaurantLocation extends BaseEntity {
  @Column()
  address!: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude!: number;

  @ManyToOne('District')
  @JoinColumn()
  district!: any;

  @ManyToOne('Restaurant')
  @JoinColumn()
  restaurant!: any;
}
