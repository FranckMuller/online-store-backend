import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./schemas/order.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private usersService: UsersService
  ) {}

  async createOrder(dto, userId) {
    const user = await this.usersService.findById(userId);
    if (!user) new ForbiddenException("forbidden");

    const data = {
      user: user.id,
      items: dto.items,
      amount: 1000
    };
    const order = await this.orderModel.create(data);
    console.log(order);
    return order;
  }

  async findAll() {
    const orders = await this.orderModel
      .find({})
      .populate({ path: "user" })
    

    return orders;
  } 
}
