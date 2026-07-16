import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Repository } from "typeorm/repository/Repository.js";
import { CreateCategoryDto } from "./dto/create-categorie-dto";
import { ErrorsExceptions } from "../../Errors/custom-errors-exceptions";
import { CategoryErrors } from "../../Errors/category.errors";



@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>
    ) { }

    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find()
    }

    async create(body: CreateCategoryDto): Promise<CreateCategoryDto> {
        const newCategory = this.categoryRepository.create(body);
        return await this.categoryRepository.save(newCategory);
    }

    async bulkCreate(categories: CreateCategoryDto[]): Promise<CreateCategoryDto[]> {
        const createCategories = await this.categoryRepository
            .createQueryBuilder('categories')
            .insert()
            .values(categories)
            .execute();
        return createCategories.raw;
    }

    async delete(id: string): Promise<string> {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            throw ErrorsExceptions.notFound(CategoryErrors.NOT_FOUND_CATEGORY.errorCode, CategoryErrors.NOT_FOUND_CATEGORY.message);
        }
        await this.categoryRepository.delete(id);
        return "Categoría eliminada correctamente";
    }
}