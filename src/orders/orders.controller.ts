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
import { CreateOrderDto } from "./dto/create-order.dto";
import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { GetOrdersDto } from "./dto/get-orders.dto";

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

  @Post("confirm")
  confirmOrder(@Body() dto) {
    return this.ordersService.confirmOrder(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  createOrder(
    @Body() dto: CreateOrderDto,
    @UseUser() user: IAccessTokenPayload
  ) {
    return this.ordersService.createOrder(dto, user.userId);
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
