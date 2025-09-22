import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import bcrypt from 'bcrypt';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  phone?: string;

  // Hash password before saving
  async hashPassword(): Promise<void> {
    if (this.password) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Verify password
  async verifyPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
