import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MakePaymentDto {
  @IsNotEmpty()
  @ApiProperty({ example: 100 })
  amount: number;
  
  @IsNotEmpty()
  @ApiProperty()
  orderId: string
}
