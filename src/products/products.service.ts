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

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly usersService: UsersService
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
      images: images.map((image) => image.path),
      owner: user.id,
    };
    const product = await this.productModel.create(productData);
    user.products.push(product.id);
    const updatedUser = await user.save();
    return product;
  }

  async getMyProducts(userId: string) {
    const products = await this.productModel.find({ owner: userId });
    return products;
  }

  async findAll() {
    const products = await this.productModel.find({ published: true });
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
