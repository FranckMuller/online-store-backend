import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Product } from "../../products/schemas/product.schema";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({type: Array<string>})
  roles: {
    type: string[];
    default: ["user"];
  };
  
  @Prop()
  refreshToken: string

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }] })
  products: Product[];
}

export const UserSchema = SchemaFactory.createForClass(User);
