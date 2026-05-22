import { UsersController } from './users/users.controller';
import { ProductsController } from './products/products.controller';
import { CategoriesController } from './categories/categories.controller';
import { ProductCategoriesController } from './product-categories/product-categories.controller';
import { OrdersController } from './orders/orders.controller';
import { OrderProductsController } from './order-products/order-products.controller';

describe('Basic entity controllers', () => {
  it('users controller responds with base message', () => {
    expect(new UsersController().getBase()).toEqual({
      message: 'Users controller',
    });
  });

  it('products controller responds with base message', () => {
    expect(new ProductsController().getBase()).toEqual({
      message: 'Products controller',
    });
  });

  it('categories controller responds with base message', () => {
    expect(new CategoriesController().getBase()).toEqual({
      message: 'Categories controller',
    });
  });

  it('product categories controller responds with base message', () => {
    expect(new ProductCategoriesController().getBase()).toEqual({
      message: 'Product categories controller',
    });
  });

  it('orders controller responds with base message', () => {
    expect(new OrdersController().getBase()).toEqual({
      message: 'Orders controller',
    });
  });

  it('order products controller responds with base message', () => {
    expect(new OrderProductsController().getBase()).toEqual({
      message: 'Order products controller',
    });
  });
});
