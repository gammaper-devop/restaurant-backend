import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Category extends BaseEntity {
  @Column()
  name!: string;

  @OneToMany('Restaurant', 'category')
  restaurants!: any[];
}
