import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { OrderErrors } from "../../../Errors/order.errors";
import { PaymentMethod } from "../entities/order.entity";

export enum Delivered {
    CADETE = "cadete",
    LOCAL = "retiro en local",
    CORDINATE = "acordar con vendedor"
}

export default class Create_order_dto {
    @ApiProperty({
        type: "string",
        nullable: false,
        example: "Franco"
    })
    @IsNotEmpty({
        message: OrderErrors.BAD_REQUEST_NAME.message
    })
    client_name!: string

    @ApiProperty({
        type: "string",
        nullable: false,
        example: "Itria"
    })
    @IsNotEmpty({
        message: OrderErrors.BAD_REQUEST_SURNAME.message
    })
    client_surname!: string

    @ApiProperty({
        type: "array",
        nullable: false,
        description: `Si required selection es 0, se manda como producto 1, si es 1 y 
        quiere llevar mas de un producto tendría que mandarse como en el caso de producto-3. 
        Si un producto tiene required  selection más de 1, el product se mandaría como
        en el caso de producto-2 (ejemplo el tinta dapop 2x1, que es un producto 
        que requiere elegir más de una variedad, si quiere llevar mas de un tinta dapop 2x1,
        tendría que mandarse como producto-3 donde cada uno tendría las varityId 
        como producto-2) 
        `,
        items: {
            type: "object",
            properties: {
                id: { type: "string" },
                quantity: { type: "number" },
                varityId: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            quantity: { type: "number" }
                        }
                    }
                }
            },
            required: ["id"]
        },
        example: [
            { id: "id-del-producto-1", quantity: 1 },
            {
                id: "fcd89053-7d7e-4e3d-87ef-66abb33871ee",
                quantity: 3,
                varityId: [
                    {
                        id: "7804e896-3ac9-47c8-9a8e-f3045067a7ae",
                        quantity: 1
                    },
                    {
                        id: "78f3a631-f8d0-4153-a3e8-a8bdce748714",
                        quantity: 2
                    }
                ]
            }
        ]
    })
    @IsNotEmpty({
        message: OrderErrors.BAD_REQUEST_PRODUCTS.message
    })
    @IsArray()
    products!: { id: string, quantity?: number, varityId?: { id: "string", quantity: number }[] }[]

    @ApiProperty({
        type: "string",
        nullable: false,
        example: Delivered.LOCAL
    })
    @IsNotEmpty({
        message: OrderErrors.BAD_REQUEST_DELIVERED.message
    })
    @IsEnum(Delivered)
    delivered!: Delivered

    @ApiProperty({
        type: "string",
        nullable: false,
        example: PaymentMethod.TRANSFER
    })
    @IsNotEmpty({
        message: OrderErrors.BAD_REQUEST_PAYMENT_METHOD.message
    })
    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod

    @ApiProperty({
        type: "string",
        nullable: false,
        example: "3434403870"
    })
    @IsNotEmpty({
        message: OrderErrors.BAD_REQUEST_PHONE.message
    })
    phone!: string

    @ApiProperty({
        type: "object",
        properties: {
            street: { type: "string" },
            number: { type: "number" },
            floor: { type: "number", nullable: true },
            letter: { type: "string", nullable: true }
        },
        example: {
            street: "Rosario del Tala",
            number: 543,
            floor: null,
            letter: null
        }
    })
    @IsOptional()
    shippingData?: {
        street: string,
        number: number,
        floor?: number,
        letter: string
    }

    @ApiProperty({
        type: "string",
        example: "Puedo pasar a buscarlo el Lunes?"
    })
    @IsOptional()
    coment?: string
}