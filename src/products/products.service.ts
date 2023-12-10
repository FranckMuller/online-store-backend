import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Express } from "express";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { EProductsSort } from "./dto/get-products.dto";
import { Product } from "./schemas/product.schema";
import { UsersService } from "../users/users.service";
import { ImagesService } from "../images/images.service";

// TODO enum

type TSortProducts = {
  createdAt?: 1 | -1;
  price?: 1 | -1;
};

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
  categories: 1,
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly usersService: UsersService,
    private readonly imagesService: ImagesService
  ) {}
  
  async findAll(filters) {
    let sort: TSortProducts = {};

    if (filters.sort) {
      switch (filters.sort) {
        case EProductsSort.Newest:
          sort.createdAt = 1;
          break;
        case EProductsSort.Oldest:
          sort.createdAt = -1;
          break;

        case EProductsSort.HighPrice:
          sort.price = -1;
          break;

        case EProductsSort.MinPrice:
          sort.price = 1;
          break;
      }
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: {} },
      {
        $project: {
          _id: 0,
          name: 1,
          price: 1,
          description: 1,
          categories: 1,
          mainImage: 1,
          createdAt: 1,
          id: "$_id",
        },
      },
      { $sort: sort },

      {
        $lookup: {
          from: "images",
          localField: "mainImage",
          foreignField: "_id",
          as: "mainImage",
        },
      },
      { $unwind: "$mainImage" },
    ];

    const products = await this.productModel.aggregate(pipeline);

    return products;
  }

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

  // TODO catch error / fix bug with main image
  async update(userId, productId, updateProductDto, images, mainImage) {
    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException("product not found");
    }
    const user = await this.usersService.findById(userId);

    if (updateProductDto.deletingImagesIds) {
      const ids = JSON.parse(updateProductDto.deletingImagesIds);
      const deletingResult = await this.imagesService.deleteMany(ids);
      const newImagesIds = product.images.filter((el) => {
        if (!ids.includes(el.toString())) {
          return true;
        }
      });
      product.images = newImagesIds;
    }

    if (images && images.length) {
      const loadedImages = await this.imagesService.create(images);
      for (let i = 0; i < loadedImages.length; i++) {
        product.images.unshift(loadedImages[i].id);
      }
      console.log(product.images[0]);
      if (!updateProductDto.mainImageId) {
        product.mainImage = product.images[0];
      }
    }

    if (updateProductDto.mainImageId) {
      product.mainImage = updateProductDto.mainImageId;
    }

    const newCategories = JSON.parse(updateProductDto.categories).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    product.name = updateProductDto.name;
    product.description = updateProductDto.description;
    product.price = updateProductDto.price;
    product.published = updateProductDto.published;
    product.categories = newCategories;

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

  async findOneById(id: string) {
    try {
      const product = await this.productModel
        .findById(id)
        .select(selectedMyProductsFields)
        .populate({ path: "images", select: "id path" })
        .populate({ path: "mainImage", select: "id path" })
        .populate({ path: "categories" });
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
