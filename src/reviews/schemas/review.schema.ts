import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "../../users/schemas/user.schema";
import { Product } from "../../products/schemas/product.schema";

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  rating: number;

  @Prop()
  text: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  user: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Product" })
  product: string;
}

const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ReviewSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export { ReviewSchema };
