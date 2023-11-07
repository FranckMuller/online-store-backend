import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Product } from "../../products/schemas/product.schema";

export type ImageDocument = HydratedDocument<Image>;

@Schema()
export class Image {
  @Prop({ required: true, unique: true })
  path: string;

  @Prop({ required: true, unique: true })
  filename: string;
}

const ImageSchema = SchemaFactory.createForClass(Image);

ImageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

ImageSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

export { ImageSchema };
