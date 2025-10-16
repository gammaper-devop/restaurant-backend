import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { City } from './City';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany('City', 'country')
  cities!: City[];
}
