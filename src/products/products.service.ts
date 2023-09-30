import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Express } from "express";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./schemas/product.schema";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>
  ) {}

  async create(
    createProductDto: CreateProductDto,
    images: Array<Express.Multer.File>
  ) {
    const productData = {
      ...createProductDto,
      images: images.map((image) => image.path),
    };
    const product = await this.productModel.create(productData);
    console.log(product);
    return product;
  }

  async findAll() {
    const products = await this.productModel.find({});
    console.log(products)
    return products;
  }

  async findOneById(id: string) {
    try {
      const product = await this.productModel.findById(id);
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

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productModel.findByIdAndUpdate(id, {
        ...updateProductDto,
      });
      return product;
    } catch (error) {
      throw new BadRequestException("Something bad happend");
    }
  }

  async deleteOneById(id: string) {
    const result = await this.productModel.findByIdAndDelete(id);
    return result;
  }
}
