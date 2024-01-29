import { ArrayNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
  @ArrayNotEmpty()
  @ApiProperty({
    example: [{ quantity: 3, productId: "65b3a4857eb90110d3088414" }]
  })
  items: [{ quantity: number; productId: string }];
}
