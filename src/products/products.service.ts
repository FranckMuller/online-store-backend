import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Express } from "express";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./schemas/product.schema";
import { UsersService } from "../users/users.service";
import { ImagesService } from "../images/images.service";

// TODO enum

enum ProductFields {
  _Id = "_id",
  Id = "id",
  Name = "name",
  Description = "description",
  Price = "price",
  Images = "images",
  MainImage = "mainImage",
  Published = "published",
}

const selectedMyProductsFields = {
  id: 1,
  name: 1,
  description: 1,
  price: 1,
  images: 1,
  mainImage: 1,
  published: 1,
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly usersService: UsersService,
    private readonly imagesService: ImagesService
  ) {}

  // TODO refactoring with additional update method of UsersService
  async create(
    createProductDto: CreateProductDto,
    images: Array<Express.Multer.File>,
    userId: string
  ) {
    const user = await this.usersService.findById(userId);
    const productData = {
      ...createProductDto,
      owner: user.id,
    };
    const product = await this.productModel.create(productData);

    const loadedImages = await this.imagesService.create(images);

    for (let i = 0; i < loadedImages.length; i++) {
      product.images.push(loadedImages[i].id);
    }

    if (!createProductDto.mainImage) {
      product.mainImage = loadedImages[0].id;
    }

    user.products.push(product.id);
    await product.save();
    await user.save();
    return product;
  }

  // TODO catch error
  async update(userId, productId, updateProductDto, images, mainImage) {
    const product = await this.productModel.findById(productId);
console.log(images)
console.log(mainImage)
console.log(updateProductDto.mainImageId)
    if (!product) {
      throw new NotFoundException("product not found");
    }

    const user = await this.usersService.findById(userId);

    if (images && images.length) {
     const loadedImages = await this.imagesService.create(images);
      for (let i = 0; i < loadedImages.length; i++) {
        product.images.push(loadedImages[i].id);
      }
    }

    if (updateProductDto.mainImageId) {
      product.mainImage = updateProductDto.mainImageId;
    }

    if (mainImage && mainImage.length) {
      const newMainImage = await this.imagesService.createOne(mainImage);
      product.mainImage = newMainImage.id;
    }

    product.name = updateProductDto.name;
    product.description = updateProductDto.description;
    product.price = updateProductDto.price;

    await product.save();
    return product;
  }

  async getMyProducts(userId: string) {
    const products = await this.productModel
      .find({ owner: userId })
      .select(`-${ProductFields.Images}`)
      .populate({ path: "mainImage" })
      .exec();

    if (!products) {
      throw new NotFoundException("products not found");
    }

    return products;
  }

  async findAll() {
    const products = await this.productModel
      .find({ published: true })
      .populate({ path: "mainImage" });
    return products;
  }

  async findOneById(id: string) {
    try {
      const product = await this.productModel
        .findById(id)
        .select(selectedMyProductsFields)
        .populate({ path: "images", select: "id path filename" })
        .populate({ path: "mainImage", select: "id path filename" });
      if (product) {
        return product;
      } else {
        throw new NotFoundException("product not found");
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException("Something bad happend");
    }
  }

  // TODO refactoring check if product owner
  async deleteOneById(id: string, userId) {
    const product = await this.productModel.findById(id);
    if (userId === product.owner.toString()) {
      const result = await this.productModel.findByIdAndDelete(id);
      return result;
    } else {
      throw new ForbiddenException();
    }
  }
}
