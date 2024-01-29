import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Get
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { UseUser } from "../decorators/use-user.decorator";
import { CreateOrderDto } from "./dto/create-order.dto";
import { AccessTokenGuard } from "../common/guards/access-token.guard";

interface IAccessTokenPayload {
  userId: string;
  username: string;
}

@ApiBearerAuth()
@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  createOrder(
    @Body() dto: CreateOrderDto,
    @UseUser() user: IAccessTokenPayload
  ) {
    this.ordersService.createOrder(dto, user.userId);
  }
}
