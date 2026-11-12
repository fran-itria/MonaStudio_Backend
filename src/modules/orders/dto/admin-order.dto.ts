import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import Create_order_dto from "./createOrder.dto";
import { OrderStatus, PaymentStatus } from "../entities/order.entity";

/** Orden cargada desde el panel: el admin indica si ya cobró. Siempre queda aceptada. */
export class AdminCreateOrderDto extends Create_order_dto {
    @ApiPropertyOptional({ enum: PaymentStatus, example: PaymentStatus.PAID, description: 'Estado del pago (por defecto pending)' })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus
}

export class UpdateOrderStatusDto {
    @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.DELIVERED })
    @IsOptional()
    @IsEnum(OrderStatus)
    state?: OrderStatus

    @ApiPropertyOptional({ enum: PaymentStatus, example: PaymentStatus.PAID })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus

    @ApiPropertyOptional({ type: 'boolean', example: true, description: 'Archivar o desarchivar la orden' })
    @IsOptional()
    @IsBoolean()
    archived?: boolean
}

export interface OrdersFilters {
    page?: number
    limit?: number
    state?: string
    /** Excluye un estado (ej: rejected para ver solo las activas) */
    excludeState?: string
    paymentStatus?: string
    delivered?: string
    archived?: string
    source?: string
    search?: string
}
