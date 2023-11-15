import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Express } from "express";
import { Image } from "./schemas/image.schema";


@Injectable()
export class ImagesService {
  constructor(@InjectModel(Image.name) private imageModel: Model<Image>) {}

  async create(images: Array<Express.Multer.File>) {
    const createImagesPromises = images.map(async (i) => {
      const data = {
        filename: i.filename,
        path: `/${i.path}`,
      };
      const image = await this.imageModel.create(data);
      return image;
    });

    return await Promise.all(createImagesPromises);
  }

  async createOne(image: Array<Express.Multer.File>) {
    const data = {
      filename: image[0].filename,
      path: `/${image[0].path}`,
    };
    const result = await this.imageModel.create(data);
    return result;
  }

  async deleteMany(ids: Array<string>) {
    const result = await this.imageModel.deleteMany({ _id: { $in: ids } });
    return result;
  }
}
