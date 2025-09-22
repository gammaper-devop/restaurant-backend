import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import type { City } from './City';

@Entity()
export class Country extends BaseEntity {
  @Column()
  name!: string;

  @OneToMany('City', 'country')
  cities!: City[];
}
