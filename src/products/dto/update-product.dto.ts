import { PartialType } from "@nestjs/swagger";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {
  existImages: string[];
  mainImage: string;
  mainImageId: string;
}
