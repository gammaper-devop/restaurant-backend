import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from './Category';
import { City } from './City';
import { Dish } from './Dish';
import { Menu } from './Menu';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  logo!: string; // URL or path to logo image

  @Column({ type: 'text', nullable: true })
  phone!: string;

  @ManyToOne('Category')
  @JoinColumn()
  category!: Category;

  @OneToMany('Dish', 'restaurant')
  dishes!: Dish[];

  @OneToMany('Menu', 'restaurant')
  menus!: Menu[];

  @OneToMany('RestaurantLocation', 'restaurant')
  locations!: any[];
}
