import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOkResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewResponse } from "./response.types";
import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { UseUser } from "../decorators/use-user.decorator";
import type { IUserPayload } from "../decorators/use-user.decorator";

@ApiBearerAuth()
@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get()
  getAll() {
    return this.reviewsService.getAll();
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @ApiOkResponse({ type: ReviewResponse })
  @Post(":productId")
  create(
    @Param("productId") productId: string,
    @UseUser() user: IUserPayload,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(productId, user.userId, createReviewDto);
  }

  @Get(":productId")  
  getAllByProductId(@Param("productId") productId: string) {
    return this.reviewsService.getAllByProductId(productId);
  }

  @Delete(":id")
  deleteOneById(@Param("id") id: string) {
    return this.reviewsService.deleteOneById(id);
  }
}
