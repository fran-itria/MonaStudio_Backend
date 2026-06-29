import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateImagesDto } from './dto/create-image.dto';
import { ProductVarityImage } from './entities/varity-image.entity';

@Injectable()
export class ProductVarityImageService {
    constructor(
        @InjectRepository(ProductVarityImage)
        private readonly imageRepository: Repository<ProductVarityImage>) { }

    async bulkCreate(images: CreateImagesDto[]) {
        for (const { productVarityId, url } of images) {
            const newImage = this.imageRepository.create({ productVarityId, url })
            await this.imageRepository.save(newImage)
        }
        return
    }
}
