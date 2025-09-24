import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { District } from './District';
import { Restaurant } from './Restaurant';
import { OperatingHours, DEFAULT_OPERATING_HOURS } from '../types/OperatingHours';

@Entity()
export class RestaurantLocation extends BaseEntity {
  @Column()
  address!: string;

  @Column({ type: 'text', nullable: true })
  phone!: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude!: number;

  @Column('json', { default: () => `'${JSON.stringify(DEFAULT_OPERATING_HOURS)}'` })
  operatingHours!: OperatingHours;

  @ManyToOne('District')
  @JoinColumn()
  district!: District;

  @ManyToOne('Restaurant')
  @JoinColumn()
  restaurant!: Restaurant;
}
