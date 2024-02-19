import {
  Injectable,
  NotFoundException,
  ForbiddenException
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

  async getAllByProductId(productId, params) {
    const reviews = await this.reviewModel
      .find({ product: productId })
      .limit(params.limit)
      .skip(params.offset)
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "username avatarMini id" });

    const count = await this.reviewModel.countDocuments({ product: productId });
    const nextOffset = +params.offset + +params.limit;
    const offset =
      +params.offset + +params.limit + 1 <= count ? nextOffset : undefined;

    return {
      reviews,
      offset
    };
  }

  async create(productId, userId: string, createReviewDto) {
    let product = await this.productsService.findOneById(productId);
    const user = await this.usersService.findById(userId);
    let review = await this.reviewModel.create({
      ...createReviewDto,
      user: user.id,
      product: product.id
    });

    product.rating = createReviewDto.rating;
    product.markModified("rating");

    product.reviews.push(review.id);
    user.reviews.push(review.id);

    product = await product.save();
    product.averageRating = +product.rating;
    const newProduct = await product.save();
    await user.save();

    review = await review.populate({
      path: "user",
      select: "username avatarMini id"
    });

    return review;
  }

  async update(id, userId, dto) {
    let review = await this.findOneById(id);
    if (!review) throw new NotFoundException("review not found");

    const user = await this.usersService.findById(userId);
    if (!user || review.user.toString() !== user.id)
      throw new ForbiddenException("forbidden");

    if (dto.rating) {
      await this.productsService.updateRating(review.product, id, dto.rating, review.rating);
      review.rating = dto.rating;
    }

    review.text = dto.text;

    await review.save();
    review = await review.populate({
      path: "user",
      select: "username avatarMini id"
    });

    return review;
  }

  async deleteOneById(id: string, userId: string) {
    let review = await this.findOneById(id);
    if (userId !== review.user.toString()) {
      throw new ForbiddenException("forbidden");
    }

    await this.productsService.removeReview(review.product, review.id, review.rating);
    const result = await this.reviewModel.findByIdAndDelete(id);
    return {
      id: review.id
    };
  }

  async findOneById(id: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException("review not found");
    return review;
  }
}
