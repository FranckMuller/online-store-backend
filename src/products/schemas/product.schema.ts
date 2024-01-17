import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "../../users/schemas/user.schema";
import { Image } from "../../images/schemas/image.schema";
import { Review } from "../../reviews/schemas/review.schema";
import { getAverageRating, setRating } from "./helper";

import type { IProductRatingObj } from "../../types/products.types";

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
  toObject: { getters: true },
  toJSON: { getters: true }
})
export class Product {
  @Prop({ required: true, unique: false })
  name: string;

  @Prop({ required: true, unique: false })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  published: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  owner: string;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
    default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    get: getAverageRating,
    set: setRating,
    validate: {
      validator: function (i) {
        let b = [1, 2, 3, 4, 5];
        let v = Object.keys(i).sort();
        return b.every((x, j) => v.length === b.length && x === parseInt(v[j]));
      },
      message: "Invalid Star Level"
    }
  })
  rating: IProductRatingObj;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }] })
  images: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Image" })
  mainImage: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Category" })
  category: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Review.name }]
  })
  reviews: [string];
}

const ProductSchema = SchemaFactory.createForClass(Product);

// ProductSchema.virtual("id").get(function () {
//   return this._id.toHexString();
// });

ProductSchema.virtual("totalReviews").get(function () {
  return this.reviews.length;
});

ProductSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export { ProductSchema };
