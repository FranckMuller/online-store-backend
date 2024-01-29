import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { UsersModule } from "../users/users.module";
import { Order, OrderSchema } from "./schemas/order.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    UsersModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
