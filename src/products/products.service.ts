import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
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
import {
  selectedProductsFields,
  selectedMyProductsFields
} from "./selected-fields";
import { ProductDocument } from "./schemas/product.schema";
import type { TSortProducts } from "../types/products.types";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly imagesService: ImagesService
  ) {}

  async findAll(filters) {
    const { $match, $sort } = await this.getMappedFilters(filters);

    const products = await this.productModel
      .find($match)
      .sort($sort)
      .populate({ path: "mainImage" })
      .populate({ path: "owner", select: "username" })
      .select(`-images`)
      .then(p => p.map(product => product.toJSON({ getters: true })));
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
      owner: user.id
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
      const newImagesIds = product.images.filter(el => {
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
      // .select(`-${ProductFields.Images}`)
      // .select(selectedProductsFields)
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
      .populate({ path: "images", select: "id path" })
      .populate({ path: "mainImage", select: "id path" })
      .populate({ path: "category" });

    if (product) {
      return product;
    } else {
      throw new NotFoundException("Product not found");
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

  async findAllByFilter(filters) {
    const result = await this.productModel.find(filters);
    return result;
  }

  async findOne(filters) {
    const product = await this.productModel.findOne(filters);
    return product;
  }

  async updateRating(reviewId, value, oldValue) {
    let key = `rating.${value}`;
    let oldKey = `rating.${oldValue}`;

    const product = await this.productModel.updateOne(
      { reviews: reviewId },
      {
        $inc: {
          [key]: 1,
          [oldKey]: -1
        }
      },
      { setter: false }
    );

    return product;
  }

  async removeReview(reviewId: string, ratingValue) {
    let key = `rating.${ratingValue}`;
    const product = await this.productModel.updateOne(
      { reviews: reviewId },
      {
        $pull: {
          reviews: reviewId
        },
        $inc: {
          [key]: -1
        }
      },
      { setter: false }
    );
    return product;
  }

  async getFavorites(userId) {
    const user = await this.usersService.findById(userId);
    return this.productModel.find({ _id: { $in: user.favorites } }).populate({ path: "images", select: "id path" })
      .populate({ path: "mainImage", select: "id path" })
      .populate({ path: "category" });;
  }

  async toggleFavorites(productId, userId) {
    const user = await this.usersService.findById(userId);
    const product = await this._findById(productId);
    const idx = user.favorites.findIndex(id => id.toString() === product.id);
    if (idx === -1) {
      user.favorites.push(product.id);
    } else {
      user.favorites.splice(idx, 1);
    }

    await user.save();
    return;
  }

  private getCategoryByName(categoryName: string) {
    return this.categoriesService.findByName(categoryName);
  }

  private async getMappedFilters(filters) {
    const { sort, ...match } = filters;
    const $match = await this.getFilterMatch(match);
    const $sort = this.getFilterSort(sort);

    return { $match, $sort };
  }

  private async getFilterMatch(filters) {
    let $match: any = {};

    if (filters.minPrice && filters.maxPrice) {
      $match = {
        $and: [
          {
            price: {
              $gte: Number(filters.minPrice),
              $lte: Number(filters.maxPrice)
            }
          }
        ]
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

    if (filters.rating) {
      $match.rating = 1;
    }

    return $match;
  }

  getFilterSort = (sort: keyof EProductsSort) => {
    let $sort: TSortProducts = {
      createdAt: -1
    };
    switch (sort) {
      case EProductsSort.Newest as string:
        $sort.createdAt = -1;
        break;

      case EProductsSort.Oldest as string:
        $sort.createdAt = 1;
        break;

      case EProductsSort.HighPrice as string:
        delete $sort.createdAt;
        $sort.price = -1;
        break;

      case EProductsSort.MinPrice as string:
        delete $sort.createdAt;
        $sort.price = 1;
        break;
    }

    return $sort;
  };

  private async _findById(id) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('product not found');
    return product;
  }
}
