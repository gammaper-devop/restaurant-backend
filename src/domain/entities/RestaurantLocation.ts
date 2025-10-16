import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class RestaurantLocation {
  @PrimaryGeneratedColumn()
  id!: number;

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
  restaurantId!: any;
}
