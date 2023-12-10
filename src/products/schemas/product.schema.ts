import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "../../users/schemas/user.schema";
import { Image } from "../../images/schemas/image.schema";

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
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
  owner: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }] })
  images: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Image" })
  mainImage: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    default: [],
  })
  categories: string[];
}

const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ProductSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export { ProductSchema };
