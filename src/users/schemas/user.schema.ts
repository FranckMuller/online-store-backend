require("dotenv").config();
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Product } from "../../products/schemas/product.schema";
import { Review } from "../../reviews/schemas/review.schema";

enum ERoles {
  User = "user",
  Admin = "admin",
}
export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Array<string>, required: true, default: ["user", "admin"] })
  roles: string[];

  @Prop()
  refreshToken: string;

  @Prop({
    type: String,
    required: true,
    default: `${process.env.APP_URL}/uploads/avatar.png`,
  })
  avatar: string;

  @Prop({
    type: String,
    required: true,
    default: `${process.env.APP_URL}/uploads/avatar-mini.png`,
  })
  avatarMini: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }] })
  products: [string];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] })
  reviews: [string];
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] })
  favorites: [string];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// UserSchema.set("toJSON", {
//   virtuals: true,
//   transform: (doc, ret, options) => {
//     delete ret.__v;
//     ret.id = ret._id.toString();
//     delete ret._id;
//   },
// });
