import { IsOptional, IsString } from "class-validator";
import {EOrderStatus} from '../schemas/order.schema'

export class GetOrdersDto {
  @IsOptional()
  @IsString()
  status: keyof EOrderStatus
}