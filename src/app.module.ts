import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule } from "@nestjs/config";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { FilesModule } from "./files/files.module";
import { AuthModule } from "./auth/auth.module";
import {ImagesModule} from './images/images.module'

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true,}),
    MongooseModule.forRoot(process.env.DB_URL, {
      connectionFactory: (connection) => {
        connection.on("connected", () => {
          console.log("connected to mongodb");
        });
        connection._events.connected();
        return connection;
      },
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    FilesModule,
    ImagesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
