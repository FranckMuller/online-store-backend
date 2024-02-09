import { ArrayNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
  @ArrayNotEmpty()
  @ApiProperty()
  event: string;

  @ApiProperty()
  object: {
    id: string;
    status: string;
    amount: { value: string; currency: string };
    income_amount: { value: string; currency: string };
    description: string;
    created_at: string;
    paid: true;
    refundable: true;
    metadata: {};
  };
}
