import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @IsNotEmpty()
  @ApiProperty({ example: "IPhone" })
  name: string;

  @IsNotEmpty()
  @ApiProperty({ example: "Xiaomi is better" })
  description: string;

  @IsNotEmpty()
  @ApiProperty({ example: 200 })
  price: number;

  @IsNotEmpty()
  @ApiProperty({
    type: Array,
    format: "binary",
  })
  images: string[];
}
