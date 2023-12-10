import { IsOptional, IsString } from "class-validator";

export enum EProductsSort {
  HighPrice = "high-price",
  MinPrice = "min-price",
  Newest = "newest",
  Oldest = "oldest",
}

export class GetProductsDto {
  @IsOptional()
  @IsString()
  sort: keyof EProductsSort;

  @IsOptional()
  @IsString()
  searchTerm: string;

  @IsOptional()
  @IsString()
  rating: string;

  @IsOptional()
  @IsString()
  minPrice: string;

  @IsOptional()
  @IsString()
  maxPrice: string;

  @IsOptional()
  @IsString()
  category: string;
}
