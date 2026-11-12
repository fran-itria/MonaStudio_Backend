import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  apellido!: string;

  @Column({ type: 'varchar', length: 255 })
  contrasena!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  mail!: string;

  @Column({ type: 'boolean', default: false })
  isAdmin!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
