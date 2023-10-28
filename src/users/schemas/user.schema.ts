require("dotenv").config();
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Product } from "../../products/schemas/product.schema";

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

  @Prop({ type: Array<string>, required: true, default: ["user"] })
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
  products: Product[];
}

export const UserSchema = SchemaFactory.createForClass(User);
