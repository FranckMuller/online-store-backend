import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Cart, CartItem, type CartDocument } from "./schemas/cart.schema";

import { ProductsService } from "../products/products.service";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItem>,
    private readonly productsService: ProductsService
  ) {}

  async getCart(userId: string): Promise<CartDocument> {
    const cart = await this.cartModel
      .findOne({
        owner: new mongoose.Types.ObjectId(userId)
      })
      .populate({
        path: "items",
        populate: { path: "product", populate: { path: "mainImage" } }
      });
    return cart;
  }

  async create(dto, userId: string) {
    const product = await this.productsService.findOne({ _id: dto.productId });
    if (!product) throw new NotFoundException("product not found");

    const cart = await this.cartModel.findOne({
      owner: new mongoose.Types.ObjectId(userId)
    });

    if (!cart) {
      const item = await this.cartItemModel.create({
        product: product._id,
        quantity: dto.quantity,
        price: product.price,
        total: product.price
      });

      const items = [item._id];

      const newCart = await this.cartModel.create({
        owner: new mongoose.Types.ObjectId(userId),
        items: items,
        subTotal: product.price
      });

      item.cart = newCart._id;
      await item.save();
    } else {
      const existedItem = await this.cartItemModel.findOne({
        cart: cart._id,
        product: product._id
      });

      if (existedItem) {
        existedItem.quantity = dto.quantity;
        existedItem.total = dto.quantity * product.price;
        await existedItem.save();
      } else {
        const item = await this.cartItemModel.create({
          product: product._id,
          quantity: dto.quantity,
          price: product.price,
          total: product.price * dto.quantity
        });
        cart.items = [...cart.items, item._id];
        await cart.save();
      }
    }
  }
}
