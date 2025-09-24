import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Restaurant } from './Restaurant';

@Entity()
export class Dish extends BaseEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  image!: string; // URL or path to image

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @ManyToOne('Restaurant')
  @JoinColumn()
  restaurant!: Restaurant;
}
