import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id!: number;

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
