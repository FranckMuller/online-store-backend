import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { Order, OrderSchema } from "./schemas/order.schema";
import { UsersModule } from "../users/users.module";
import { ProductsModule } from "../products/products.module";
import { PaymentModule } from "../payment/payment.module";
import {CartModule} from '../cart/cart.module'
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

  @Module({
    imports: [
      // MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
      MongooseModule.forFeatureAsync([
        {
          name: Order.name,
          useFactory: () => {
            const schema = OrderSchema;
            schema.plugin(require("mongoose-lean-virtuals"));
            return schema;
          }
        }
      ]),
      UsersModule,
      ProductsModule,
      PaymentModule,
      CartModule
    ],
    controllers: [OrdersController],
    providers: [OrdersService]
  })
  export class OrdersModule {};
