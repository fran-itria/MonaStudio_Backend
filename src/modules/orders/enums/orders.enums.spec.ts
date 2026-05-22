import { PaymentMethod } from './payment-method.enum';
import { PaymentStatus } from './payment-status.enum';
import { State } from './state.enum';

describe('Orders enums', () => {
  it('should define payment methods', () => {
    expect(PaymentMethod.MERCADO_PAGO).toBe('MercadoPago');
    expect(PaymentMethod.EFECTIVO).toBe('Efectivo');
  });

  it('should define payment status values', () => {
    expect(PaymentStatus.PENDIENTE).toBe('Pendiente');
    expect(PaymentStatus.RECIBIDO).toBe('Recibido');
    expect(PaymentStatus.RECHAZADO).toBe('Rechazado');
  });

  it('should define state values', () => {
    expect(State.PENDIENTE).toBe('Pendiente');
    expect(State.ACEPTADO).toBe('Aceptado');
    expect(State.COMPLETADO).toBe('Completado');
    expect(State.ENTREGADO).toBe('Entregado');
  });
});
