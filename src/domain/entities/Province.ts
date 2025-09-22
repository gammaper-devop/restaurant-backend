import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Province extends BaseEntity {
  @Column()
  name!: string;

  @ManyToOne('City')
  @JoinColumn()
  city!: any;

  @OneToMany('District', 'province')
  districts!: any[];
}
