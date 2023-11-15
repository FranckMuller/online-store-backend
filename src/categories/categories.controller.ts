import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";
import {
  GetAllGategoriesResponse,
  CreateCategoryResponse,
  DeleteCategoryResponse
} from "./categories.types";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Controller("categories")
@ApiTags("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @ApiOkResponse({ type: GetAllGategoriesResponse })
  @Get()
  getAll() {
    return this.categoriesService.getAll();
  }

  @ApiOkResponse({ type: CreateCategoryResponse })
  @HttpCode(200)
  @Post()
  createOne(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createOne(createCategoryDto);
  }

  @ApiOkResponse({ type: DeleteCategoryResponse })
  @HttpCode(200)
  @Delete(":id")
  deleteOne(@Param("id") id: string) {
    return this.categoriesService.deleteOne(id);
  }
}
