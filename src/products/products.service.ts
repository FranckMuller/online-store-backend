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
import { CategoriesService } from "../categories/categories.service";

// TODO enum

type TSortProducts = {
  createdAt?: 1 | -1;
  price?: 1 | -1;
};

type TFilterProducts = {
  minPrice?: number;
  maxPrice?: number;
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
    private readonly imagesService: ImagesService,
    private readonly categoriesService: CategoriesService
  ) {}

  async findAll(filters) {
    let $sort: TSortProducts = {
      createdAt: 1,
    };
    let $match: any = {};

    if (filters.sort) {
      switch (filters.sort) {
        case EProductsSort.Newest:
          $sort.createdAt = 1;
          break;
        case EProductsSort.Oldest:
          $sort.createdAt = -1;
          break;

        case EProductsSort.HighPrice:
          delete $sort.createdAt;
          $sort.price = -1;
          break;

        case EProductsSort.MinPrice:
          delete $sort.createdAt;
          $sort.price = 1;
          break;
      }
    }

    if (filters.minPrice && filters.maxPrice) {
      $match = {
        $and: [
          {
            price: {
              $gte: Number(filters.minPrice),
              $lte: Number(filters.maxPrice),
            },
          },
        ],
      };
    }

    if (filters.maxPrice && !filters.minPrice) {
      $match.price = { $lte: Number(filters.maxPrice) };
    }

    if (filters.minPrice && !filters.maxPrice) {
      $match.price = { $gte: Number(filters.minPrice) };
    }

    if (filters.category && filters.category !== "all") {
      const foundCategory = await this.getCategoryByName(filters.category);
      $match.category = foundCategory._id;
    }

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match,
      },
      {
        $project: {
          _id: 0,
          name: 1,
          price: 1,
          description: 1,
          mainImage: 1,
          createdAt: 1,
          category: 1,
          id: "$_id",
        },
      },
      {
        $sort,
      },

      {
        $lookup: {
          from: "images",
          localField: "mainImage",
          foreignField: "_id",
          as: "mainImage",
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: {
          path: "$mainImage",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
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

      if (!updateProductDto.mainImageId) {
        product.mainImage = product.images[0];
      }
    }

    if (updateProductDto.mainImageId) {
      product.mainImage = updateProductDto.mainImageId;
    }

    const newCategory = updateProductDto.category;
    product.name = updateProductDto.name;
    product.description = updateProductDto.description;
    product.price = updateProductDto.price;
    product.published = updateProductDto.published;
    product.category = newCategory;

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
    const product = await this.productModel
      .findById(id)
      .select(selectedMyProductsFields)
      .populate({ path: "images", select: "id path" })
      .populate({ path: "mainImage", select: "id path" })
      .populate({ path: "category" })
      .populate('review')
      
    if (product) {
      return product;
    } else {
      throw new NotFoundException("product not found");
    }
  }

  async deleteOneById(id: string, userId) {
    const product = await this.productModel.findById(id);
    if (userId === product.owner.toString()) {
      const result = await this.productModel.findByIdAndDelete(id);
      return result;
    } else {
      throw new ForbiddenException();
    }
  }

  private getCategoryByName(categoryName: string) {
    return this.categoriesService.findByName(categoryName);
  }
}
