import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateCartDto {
  @IsNotEmpty()
  @ApiProperty({ example: "65d33677bda33c853b2c1a4a" })
  productId: string;

  @IsNotEmpty()
  @ApiProperty({ example: 2 })
  quantity: number;
}
