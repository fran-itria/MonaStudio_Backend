import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity('varity')
@Unique(['name'])
export class Varity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: "varchar", length: 255 })
    name!: string
}