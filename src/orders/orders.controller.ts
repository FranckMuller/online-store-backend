import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
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

  @Post("confirm")
  confirmOrder(@Body() dto) {
    console.log(dto);
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

  @UseGuards(AccessTokenGuard)
  @Get("pending")
  findPending(@UseUser() user: IAccessTokenPayload) {
    return this.ordersService.findPending(user.userId);
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
