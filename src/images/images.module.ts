import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ImageSchema, Image } from "./schemas/image.schema";
import {ImagesService} from './images.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
