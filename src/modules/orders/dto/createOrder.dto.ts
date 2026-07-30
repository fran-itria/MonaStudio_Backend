import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { OrderErrors } from "../../../Errors/order.errors";

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
        description: `Si required selection es 1 y quiere llevar mas de un producto
        tendría que mandarse como en el caso de producto-3. Si un producto tiene required 
        selection más de 1, el product se mandaría como en el caso de producto-2 (ejemplo el 
        tinta dapop 2x1, que es un producto que requiere elegir más de una variedad, si
        quiere llevar mas de un tinta dapop 2x1, tendría que mandarse como producto-3
        donde cada uno tendría las varityId como producto-2) 
        `,
        items: {
            type: "object",
            properties: {
                id: { type: "string" },
                varityId: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                }
            },
            required: ["id"]
        },
        example: [
            { id: "id-del-producto-1" },
            { id: "id-del-producto-2", varityId: ["product-varity-id-1", "product-varity-id-2"] },
            { id: "id-del-producto-3", varityId: ["product-varity-id-1"] },
            { id: "id-del-producto-3", varityId: ["product-varity-id-2"] }
        ]
    })
    @IsNotEmpty({
        message: OrderErrors.BAD_REQUEST_PRODUCTS.message
    })
    @IsArray()
    products!: { id: string, varityId?: string[] }[]

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
        type: "number",
        nullable: false,
        example: 3434403870
    })
    @IsNotEmpty({
        message: OrderErrors.BAD_REQUEST_PHONE.message
    })
    phone!: number

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
    shippingData?: number
}