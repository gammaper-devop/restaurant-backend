import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { City } from './City';
import { District } from './District';

@Entity()
export class Province extends BaseEntity {
  @Column()
  name!: string;

  @ManyToOne('City')
  @JoinColumn()
  city!: City;

  @OneToMany('District', 'province')
  districts!: District[];
}
