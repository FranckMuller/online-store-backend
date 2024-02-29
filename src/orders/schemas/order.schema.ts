import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { type HydratedDocument } from "mongoose";
import { Product } from "../../products/schemas/product.schema";

export type OrderDocument = HydratedDocument<Order>;

export enum EOrderStatus {
  Pending = "pending",
  Payed = "payed",
  Shipped = "shipped",
  Delivered = "delivered",
  Canceled = "canceled"
}

@Schema({
  timestamps: true
})
export class Order {
  @Prop({ rquired: true })
  amount: number;

  @Prop({ required: true, default: EOrderStatus.Pending })
  status: EOrderStatus;

  @Prop({
    type: [
      {
        quantity: { type: Number },
        total: { type: Number },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
      }
    ]
  })
  items: { quantity: number; product: string; total: number }[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "User" })
  user: string;

  @Prop()
  paymentUrl: string;
}

const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

OrderSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

// OrderSchema.set("toObject", {
//   virtuals: true,
//   transform: (doc, ret, options) => {
//     delete ret.__v;
//     ret.id = ret._id.toString();
//     delete ret._id;
//   }
// });

export { OrderSchema };
