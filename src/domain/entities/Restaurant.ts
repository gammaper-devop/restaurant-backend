import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Category } from './Category';
import { City } from './City';
import { Dish } from './Dish';
import { Menu } from './Menu';
import { RestaurantLocation } from './RestaurantLocation';

@Entity()
export class Restaurant extends BaseEntity {

  @Column()
  name!: string;

  @Column({ nullable: true })
  logo!: string; // URL or path to logo image

  @ManyToOne('Category')
  @JoinColumn()
  category!: Category;

  @OneToMany('Dish', 'restaurant')
  dishes!: Dish[];

  @OneToMany('Menu', 'restaurant')
  menus!: Menu[];

  @OneToMany('RestaurantLocation', 'restaurant')
  locations!: RestaurantLocation[];
}
