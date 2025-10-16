import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; // e.g., "Main Menu", "Desserts Menu"

  @Column({ nullable: true })
  file!: string; // URL or path to PDF or image

  @ManyToOne('Restaurant')
  @JoinColumn()
  restaurant!: any;
}
