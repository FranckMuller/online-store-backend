import { Injectable, ForbiddenException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class PaymentService {
  async makePayment(dto) {
    try {
      const response = await axios({
        method: "POST",
        url: "https://api.yookassa.ru/v3/payments",
        headers: {
          "Content-Type": "application/json",
          "Idempotence-Key": Date.now()
        },
        auth: {
          username: process.env.SHOP_ID,
          password: process.env.SECRET_KEY
        },
        data: {
          amount: {
            value: dto.amount,
            currency: "RUB"
          },
          capture: true,
          confirmation: {
            type: "redirect",
            return_url: "http://localhost:3000/catalog"
          },
          description: 'order #1'
        }
      });

      console.log(response);
      return response.data
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }
}
