import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "../../users/schemas/user.schema";
import { Image } from "../../images/schemas/image.schema";
import { Review } from "../../reviews/schemas/review.schema";

import type { IProductRatingObj } from "../../types/products.types";

export type ProductDocument = HydratedDocument<Product>;
// versionKey: false
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
    default: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
    get: function (r) {
      let items = Object.entries(r);
      let sum = 0;
      let total = 0;
      for (let [key, value] of items) {
        total += value as number;
        sum += ((value as number) * parseInt(key)) as number;
      }
      return Math.round(sum / total);
    },
    set: function (r) {
      if (!(this instanceof mongoose.Document)) {
        if (r instanceof Object) return r;
        else {
          throw new Error("");
        }
      } else {
        if (r instanceof Object) {
          return r;
        }
        this.get("rating", null, { getters: false })[r] =
          1 + parseInt(this.get("rating", null, { getters: false })[r]);
        return this.get("rating", null, { getters: false });
      }
    },
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

ProductSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export { ProductSchema };
