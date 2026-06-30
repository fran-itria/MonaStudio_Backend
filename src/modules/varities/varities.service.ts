import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Varity } from './entities/varity.entity';
import { Repository } from 'typeorm';
import { ErrorsExceptions } from '../../Errors/custom-errors-exceptions';
import { VarityErrors } from '../../Errors/varity.errors';
import { CreateVarityDto } from './dto/create-varity.dto';

@Injectable()
export class VaritiesService {
    constructor(
        @InjectRepository(Varity)
        private readonly varityRepository: Repository<Varity>
    ) { }

    async create(name: CreateVarityDto) {
        if (!name) throw ErrorsExceptions.badRequest(VarityErrors.NOT_NAME_PROPERTY.errorCode, VarityErrors.NOT_NAME_PROPERTY.message)
        const varity = this.varityRepository.create(name)
        await this.varityRepository.save(varity)
        return 201
    }

    async bulkCreate(varities: CreateVarityDto[]) {
        await this.varityRepository.createQueryBuilder()
            .insert()
            .into(Varity)
            .values(varities)
            .orIgnore()
            .execute()
        return 201
    }

    async getAll(name: string) {
        const varities = await this.varityRepository.findAndCount({
            order: {
                name: 'ASC'
            }
        })
        if (!varities.length) throw ErrorsExceptions.notFound(VarityErrors.NOT_FOUND_VARITIES.errorCode, VarityErrors.NOT_FOUND_VARITIES.message)
        return varities
    }
}
