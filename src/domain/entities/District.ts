import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Province } from './Province';

@Entity()
export class District extends BaseEntity {
  @Column()
  name!: string;

  @ManyToOne('Province')
  @JoinColumn()
  province!: Province;
}
