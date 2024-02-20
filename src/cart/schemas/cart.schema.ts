import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import { Product } from "../../products/schemas/product.schema";
import { User } from "../../users/schemas/user.schema";

export type CartItemDocument = HydratedDocument<CartItem>;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class CartItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Cart" })
  cart: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Product.name })
  product: mongoose.Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  total: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);
CartItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Cart {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true
  })
  owner: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: CartItem.name }]
  })
  items: mongoose.Types.ObjectId[];

  @Prop({ default: 0 })
  subTotal: number;
}

const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export { CartItemSchema, CartSchema };
