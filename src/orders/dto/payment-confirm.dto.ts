import { ArrayNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PaymentConfirmDto {
  @ArrayNotEmpty()
  @ApiProperty()
  event: string;

  @ApiProperty({
    example: { status: "succeeded", description: "65df52fea77485d4fc820702" }
  })
  object: {
    status: string;
    description: string;
  };
}
