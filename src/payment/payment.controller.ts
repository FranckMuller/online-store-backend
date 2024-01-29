import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PaymentService } from "./payment.service";
import { MakePaymentDto } from "./dto/make-payment.dto";

@Controller("payment")
@ApiTags("payment")
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  makePayment(@Body() dto: MakePaymentDto) {
    console.log(1111)
    return this.paymentService.makePayment(dto);
  }
}
