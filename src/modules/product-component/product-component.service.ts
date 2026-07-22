import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductComponentDto } from './dto/create-product-component.dto';
import { EntityManager } from 'typeorm';
import { ProductComponent, SelectionMode } from './entities/product-component.entity';
import { ProductVarity } from '../product-varity/entities/product-varity.entity';

@Injectable()
export class ProductComponentService {
  async create(manager: EntityManager, data: CreateProductComponentDto): Promise<ProductComponent> {
    const productComponent = manager.create(ProductComponent, data);
    if (data.varityId) {
      const variety = await manager.findOne(ProductVarity, {
        where: { id: data.varityId },
        relations: {
          product: true
        },
      });

      if (!variety) {
        throw new NotFoundException("La variedad no existe");
      }

      if (variety?.product.id !== data.componentId) {
        throw new BadRequestException(
          'La variedad no pertenece al producto componente.'
        );
      }
    }
    if (data.selectionMode == SelectionMode.FIXED) {
      productComponent.selectionQuantity = null
    }
    if (
      data.selectionMode === SelectionMode.CUSTOM &&
      (!data.selectionQuantity || data.selectionQuantity <= 0)
    ) {
      throw new BadRequestException(
        "selectionQuantity es obligatorio para CUSTOM"
      );
    }
    return manager.save(productComponent);
  }
}
