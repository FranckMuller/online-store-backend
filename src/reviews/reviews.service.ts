import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
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

    return reviews;
  }

  async create(productId, userId: string, createReviewDto) {
    const product = await this.productsService.findOneById(productId);
    if (product) throw new NotFoundException("product not found");

    const user = await this.usersService.findById(userId);
    let review = await this.reviewModel.create({
      ...createReviewDto,
      user: user.id,
      product: product.id,
    });
    product.reviews.push(review.id);
    user.reviews.push(review.id);

    await product.save();
    await user.save();

    review = await review.populate({
      path: "user",
      select: "username avatarMini id",
    });

    return review;
  }

  async getAllByProductId(productId) {
    const reviews = await this.reviewModel
      .find({ product: productId })
      .limit(3)
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "username avatarMini id" });
    return reviews;
  }

  async deleteOneById(id: string, userId: string) {
    let review = await this.findOneById(id);

    if (userId !== review.user) throw new ForbiddenException("forbidden");

    // const result = await this.reviewModel.findByIdAndDelete(id);

    review = review.remove();
    console.log(1111111, review);
    return {
      id: review.id,
    };
    // return result;
  }

  async findOneById(id: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException("review not found");
    return review;
  }
}
