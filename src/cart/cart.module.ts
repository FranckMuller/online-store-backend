import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import {
  CartItem,
  CartItemSchema,
  Cart,
  CartSchema
} from "./schemas/cart.schema";
import {ProductsModule} from '../products/products.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
      { name: Cart.name, schema: CartSchema }
    ]),
    ProductsModule
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule {}
