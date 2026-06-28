import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImage } from './entities/product-image.entity';
import { Repository } from 'typeorm';
import { CreateImagesDto } from './dto/create-image.dto';

@Injectable()
export class ProductImageService {
    constructor(
        @InjectRepository(ProductImage)
        private readonly imageRepository: Repository<ProductImage>) { }

    async bulkCreate(images: CreateImagesDto[]) {
        for (const { productId, url } of images) {
            const newImage = this.imageRepository.create({ productId, url })
            await this.imageRepository.save(newImage)
        }
        return
    }
}
