import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "../../users/schemas/user.schema";

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ required: true, unique: false })
  name: string;

  @Prop({ required: true, unique: false })
  description: string;

  @Prop([String])
  images: string[];

  @Prop({ required: true })
  price: number;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  // owner: User;
}

const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ProductSchema.set("toJSON", {
  virtuals: true,
});

export { ProductSchema };
