import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  ParseFilePipeBuilder,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
} from "@nestjs/swagger";
import {
  FilesInterceptor,
  FileInterceptor,
  FileFieldsInterceptor,
} from "@nestjs/platform-express";
import { Express } from "express";
import { diskStorage } from "multer";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { GetProductsDto } from "./dto/get-products.dto";
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
  // TODO validate images
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

  @UseGuards(AccessTokenGuard)
  @Patch(":productId")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 5 },
        { name: "mainImage", maxCount: 1 },
      ],
      { storage: fileStorage }
    )
  )
  update(
    @Param("productId") productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles()
    files: {
      image: Array<Express.Multer.File>;
      mainImage: Express.Multer.File;
    },
    @UseUser() user
  ) {
    return this.productsService.update(
      user.id,
      productId,
      updateProductDto,
      files.image,
      files.mainImage
    );
  }

  @Get()
  findAll(@Query() filters: GetProductsDto) {
    return this.productsService.findAll(filters);
  }

  // TODO make a ApiOkResponse
  @UseGuards(AccessTokenGuard)
  @Get("my")
  getMyProducts(@UseUser() user: IAccessTokenPayload) {
    return this.productsService.getMyProducts(user.userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get("my/:id")
  getMyById(@Param("id") id: string) {
    return this.productsService.findOneById(id);
  }

  @Get(":id")
  findOneById(@Param("id") id: string) {
    return this.productsService.findOneById(id);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(":id")
  deleteOneById(@Param("id") id: string, @UseUser() user: IAccessTokenPayload) {
    return this.productsService.deleteOneById(id, user.userId);
  }
}
