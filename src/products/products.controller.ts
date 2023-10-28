import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
  ParseFilePipeBuilder,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { diskStorage } from "multer";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { fileStorage } from "../files/storage";
import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { UseUser } from "../decorators/use-user.decorator";

interface IAccessTokenPayload {
  userId: string;
  username: string;
}

@ApiBearerAuth()
@Controller("products")
@ApiTags("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FilesInterceptor("images", 5, {
      storage: fileStorage,
    })
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @UseUser() user: IAccessTokenPayload
  ) {
    return this.productsService.create(createProductDto, images, user.userId);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // TODO make a ApiOkResponse
  @UseGuards(AccessTokenGuard)
  @Get("my")
  getMyProducts(@UseUser() user: IAccessTokenPayload) {
    return this.productsService.getMyProducts(user.userId);
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
