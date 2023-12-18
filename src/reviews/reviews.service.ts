import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {Review} from './schemas/review.schema'

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>
  ) {}

  getAll() {
    return this.reviewModel.find({});
  }

  async create(createReviewDto) {
    const review = await this.reviewModel.create(createReviewDto);
    return review.save();
  }

  async getAllByProductId(productId) {
    const reviews = await this.reviewModel.find({ product: productId });
    return reviews;
  }

  async deleteOneById(id) {
    const result = await this.reviewModel.findByIdAndDelete(id)
    return result
  }
}
