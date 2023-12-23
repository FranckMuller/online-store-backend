import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Review } from "./schemas/review.schema";
import { ProductsService } from "../products/products.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService
  ) {}

  async getAll() {
    const reviews = await this.reviewModel
      .find({})
      .select({ product: 0 })
      .populate({ path: "user", select: "id username avatarMini" });

    console.log(reviews);
    return reviews;
  }

  async create(productId, userId: string, createReviewDto) {
    const product = await this.productsService.findOneById(productId);
    const user = await this.usersService.findById(userId);
    const review = await this.reviewModel.create({
      ...createReviewDto,
      user: user.id,
      product: product.id,
    });
    product.review = review.id;
    console.log(11111111);

    await product.save();
    return review;
  }

  async getAllByProductId(productId) {
    const reviews = await this.reviewModel.find({ product: productId });
    return reviews;
  }

  async deleteOneById(id) {
    const result = await this.reviewModel.findByIdAndDelete(id);
    return result;
  }
}
