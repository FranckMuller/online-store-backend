import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { EProductsSort } from "./dto/get-products.dto";

export const GetAllProducts = () => {
  return applyDecorators(
    ApiQuery({ name: "sort", enum: EProductsSort, required: false }),
    ApiQuery({ name: "searchTerm", example: "", required: false }),
    ApiQuery({ name: "rating", example: "", required: false }),
    ApiQuery({ name: "minPrice", example: "1", required: false }),
    ApiQuery({ name: "maxPrice", example: "5000", required: false }),
    ApiQuery({ name: "category", example: "", required: false })
  );
};
