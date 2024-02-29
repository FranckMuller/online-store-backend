import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Param,
  HttpCode
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { UseUser } from "../decorators/use-user.decorator";
import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { GetOrdersDto } from "./dto/get-orders.dto";
import { PaymentConfirmDto } from "./dto/payment-confirm.dto";

interface IAccessTokenPayload {
  userId: string;
  username: string;
}

@ApiBearerAuth()
@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  @UseGuards(AccessTokenGuard)
  @Get()
  getAll(
    @UseUser() user: IAccessTokenPayload,
    @Query() queryParams: GetOrdersDto
  ) {
    return this.ordersService.getAll(queryParams, user.userId);
  }

  @Post("payment-confirm")
  confirmPayment(@Body() dto: PaymentConfirmDto) {
    return this.ordersService.confirmPayment(dto);
  }
  
  @Patch('shipment-confirm/:id')
  confirmSipment(@Param('id') id: string){  
    return this.ordersService.confirmShipment(id)
  }
  
  @Patch('delivery-confirm/:id')
  confirmDelivery(@Param('id') id: string){
    return this.ordersService.confirmDelivery(id)
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  createOrder(@UseUser() user: IAccessTokenPayload) {
    return this.ordersService.createOrder(user.userId);
  }

  // TODO check if user is owner order
  @HttpCode(204)
  @UseGuards(AccessTokenGuard)
  @Patch(":id")
  cancelOrder(@Param() id) {
    return this.ordersService.cancelOrder(id);
  }

  // TODO check if user is owner order
  @HttpCode(204)
  @UseGuards(AccessTokenGuard)
  @Delete(":id")
  deleteOrder(@Param("id") id) {
    return this.ordersService.deleteOrder(id);
  }
}
