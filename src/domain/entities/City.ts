import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class City extends BaseEntity {
  @Column()
  name!: string;

  @ManyToOne('Country')
  @JoinColumn()
  country!: any;

  @OneToMany('Province', 'city')
  provinces!: any[];

  @OneToMany('RestaurantLocation', 'city')
  restaurantLocations!: any[];
}
