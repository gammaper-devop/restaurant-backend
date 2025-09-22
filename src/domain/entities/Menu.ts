import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Menu extends BaseEntity {
  @Column()
  name!: string; // e.g., "Main Menu", "Desserts Menu"

  @Column({ nullable: true })
  file!: string; // URL or path to PDF or image

  @ManyToOne('Restaurant')
  @JoinColumn()
  restaurant!: any;
}
