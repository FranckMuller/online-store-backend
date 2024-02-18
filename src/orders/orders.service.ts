import {
  Injectable,
  ForbiddenException,
  NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, EOrderStatus } from "./schemas/order.schema";
import { UsersService } from "../users/users.service";
import { ProductsService } from "../products/products.service";
import { PaymentService } from "../payment/payment.service";
import { Types } from "mongoose";

enum EPaymentStatuses {
  SUCCEEDED = "succeeded",
  CANCELED = "canceled"
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private paymentService: PaymentService
  ) {}

  async getAll(queryParams, userId) {
    const $match = { user: userId, ...queryParams };
    console.log($match)
    const orders = await this.orderModel
      .find($match)
      .select("id items amount status paymentUrl")
      .lean({ virtuals: true })
      .populate({
        path: "items.product",
        select: "id name mainImage price",
        populate: {
          path: "mainImage",
          select: "path"
        }
      });

    return orders;
  }

  async createOrder(dto, userId) {
    const user = await this.usersService.findById(userId);
    if (!user) new ForbiddenException("forbidden");

    const productsIds = dto.items.map(i => i.product);
    const products = await this.productsService.find({
      _id: { $in: productsIds }
    });

    let amount = 0;
    const items = [];
    for (let i = 0; i < products.length; i++) {
      for (let j = 0; j < dto.items.length; j++) {
        if (products[i].id === dto.items[j].product) {
          items.push({
            product: products[i].id,
            quantity: dto.items[j].quantity
          });
          amount += products[i].price * dto.items[j].quantity;
          break;
        }
      }
    }

    const data = {
      user: user.id,
      items,
      amount
    };

    const order = await this.orderModel.create(data);

    const payment = await this.paymentService.makePayment({
      amount: order.amount,
      orderId: order.id
    });

    order.paymentUrl = payment.confirmation.confirmation_url;
    await order.save();

    const createdOrder = await this.orderModel
      .findById(order.id)
      .lean()
      .populate({ path: "items.product", select: "id mainImage name price" });

    return createdOrder;
  }

  async cancelOrder(id) {
    const order = await this.orderModel.findById(new Types.ObjectId(id));
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    order.status = EOrderStatus.CANCELED;
    order.paymentUrl = null;
    await order.save();
    return;
  }

  async confirmOrder(dto) {
    const orderId = dto.object.description;
    const orderStatus = dto.object.status;
    const order = await this.orderModel.findById(new Types.ObjectId(orderId));
    if (order) {
      if (orderStatus === EPaymentStatuses.SUCCEEDED) {
        order.status = EOrderStatus.PAYED;
        order.paymentUrl = "";
        await order.save();
      }

      if (orderStatus === EPaymentStatuses.CANCELED) {
        order.status = EOrderStatus.CANCELED;
        await order.save();
        order.paymentUrl = "";
      }
    }
  }

  async deleteOrder(id) {
    const order = await this.orderModel.findByIdAndDelete(
      new Types.ObjectId(id)
    );
  }
}
