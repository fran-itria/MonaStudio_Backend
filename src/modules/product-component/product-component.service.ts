import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductComponentDto } from './dto/create-product-component.dto';
import { DataSource, Repository } from 'typeorm';
import { ProductComponent, SelectionMode } from './entities/product-component.entity';
import { ProductVarity } from '../product-varity/entities/product-varity.entity';

@Injectable()
export class ProductComponentService {
  constructor(
    private readonly dataSource: DataSource,
  ) { }

  async create(data: CreateProductComponentDto): Promise<ProductComponent> {
    return await this.dataSource.transaction(async (manager) => {
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
    })
  }

  findAll() {
    return `This action returns all productComponent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productComponent`;
  }

  update(id: number, updateProductComponentDto) {
    return `This action updates a #${id} productComponent`;
  }

  remove(id: number) {
    return `This action removes a #${id} productComponent`;
  }
}
