import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Dish {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  image!: string; // URL or path to image

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @ManyToOne('Restaurant')
  @JoinColumn()
  restaurant!: any;
}
