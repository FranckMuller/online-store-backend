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
import { CartService } from "../cart/cart.service";
import { Types } from "mongoose";

enum EPaymentStatuses {
  Succeeded = "succeeded",
  Canceled = "canceled"
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private paymentService: PaymentService,
    private cartService: CartService
  ) {}

  async getAll(queryParams, userId) {
    const $match = { user: userId, ...queryParams };
    const orders = await this.orderModel
      .find($match)
      .sort("-createdAt")
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

  async createOrder(userId) {
    const user = await this.usersService.findById(userId);
    if (!user) new ForbiddenException("forbidden");
    const cart = await this.cartService.findOne({ owner: user.id });
    const items = await this.cartService.findCartItems({
      _id: { $in: cart.items }
    });
    const orderItems = items.map(i => {
      return {
        product: i.product,
        quantity: i.quantity,
        total: i.total
      };
    });

    const orderData = {
      user: user.id,
      items: orderItems,
      amount: cart.subTotal
    };

    const order = await this.orderModel.create(orderData);
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

    order.status = EOrderStatus.Canceled;
    order.paymentUrl = null;
    await order.save();
    return;
  }

  async confirmPayment(dto) {
    const orderId = dto.object.description;
    const orderStatus = dto.object.status;
    const order = await this.orderModel.findById(orderId);
    if (order) {
      if (orderStatus === EPaymentStatuses.Succeeded) {
        order.status = EOrderStatus.Payed;
        order.paymentUrl = "";
        await order.save();
      }

      if (orderStatus === EPaymentStatuses.Canceled) {
        order.status = EOrderStatus.Canceled;
        order.paymentUrl = "";
        await order.save();
      }
    }
  }

  async confirmShipment(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException("order not found");

    if (order.status !== EOrderStatus.Payed)
      throw new ForbiddenException("order is not payed");

    order.status = EOrderStatus.Shipped;
    await order.save();
  }
  
  async confirmDelivery(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException("order not found");

    if (order.status !== EOrderStatus.Shipped)
      throw new ForbiddenException("order was not shipped");

    order.status = EOrderStatus.Delivered;
    await order.save();
  }

  async deleteOrder(id) {
    const order = await this.orderModel.findByIdAndDelete(
      new Types.ObjectId(id)
    );
  }
}
