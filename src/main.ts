import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as express from "express";
import { join } from "path";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { corsOptions } from "./config/cors.options";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors(corsOptions);

  app.use("/uploads", express.static(join(__dirname, "..", "uploads")));
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle("Amazon 2.0")
    .setDescription("The amazon API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);


  await app.listen(3500);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
