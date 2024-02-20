import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { FilesModule } from "./files/files.module";
import { AuthModule } from "./auth/auth.module";
import { ImagesModule } from "./images/images.module";
import { CategoriesModule } from "./categories/categories.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { PaymentModule } from "./payment/payment.module";
import { OrdersModule } from "./orders/orders.module";
import {CartModule} from './cart/cart.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/uploads/"
    }),
    MongooseModule.forRoot(process.env.DB_URL, {
      connectionFactory: connection => {
        connection.on("connected", () => {
          console.log("connected to mongodb");
        });
        connection._events.connected();
        return connection;
      }
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    FilesModule,
    ImagesModule,
    CategoriesModule,
    ReviewsModule,
    PaymentModule,
    OrdersModule,
    CartModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
