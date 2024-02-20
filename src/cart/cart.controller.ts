import { Controller, Body, Get, Post, UseGuards } from "@nestjs/common";
import { CartService } from "./cart.service";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UseUser } from "../decorators/use-user.decorator";
import { AccessTokenGuard } from "../common/guards/access-token.guard";

@ApiBearerAuth()
@Controller("cart")
@ApiTags("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @UseGuards(AccessTokenGuard)
  @Get()
  getCart(@UseUser() user: TAccessTokenPayload) {
    return this.cartService.getCart(user.userId);
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() dto: CreateCartDto, @UseUser() user: TAccessTokenPayload) {
    return this.cartService.create(dto, user.userId);
  }
}
