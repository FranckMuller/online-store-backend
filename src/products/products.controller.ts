import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseFilePipeBuilder,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { diskStorage } from "multer";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { fileStorage } from "../files/storage";

@Controller("products")
@ApiTags("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FilesInterceptor("images", 5, {
      storage: fileStorage,
    })
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>
  ) {
    return this.productsService.create(createProductDto, images);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  findOneById(@Param("id") id: string) {
    return this.productsService.findOneById(id);
  }

  @Patch(":id")
  @ApiConsumes("multipart/form-data")
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  deleteOneById(@Param("id") id: string) {
    return this.productsService.deleteOneById(id);
  }
}
