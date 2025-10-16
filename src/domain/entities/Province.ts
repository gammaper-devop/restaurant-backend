import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class Province {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne('City')
  @JoinColumn()
  city!: any;

  @OneToMany('District', 'province')
  districts!: any[];
}
