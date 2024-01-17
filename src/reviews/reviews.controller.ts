import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  UseGuards,
  Query
} from "@nestjs/common";
import { ApiTags, ApiOkResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewResponse } from "./response.types";
import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { UseUser } from "../decorators/use-user.decorator";
import type { IUserPayload } from "../decorators/use-user.decorator";

type GetReviewsByProductParams = {
  page: number;
  limit: number;
};

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
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.reviewsService.create(productId, user.userId, createReviewDto);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @ApiOkResponse({ type: ReviewResponse })
  @Patch(":id")
  update(
    @Param("id") id: string,
    @UseUser() user: IUserPayload,
    @Body() createReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.update(id, user.userId, createReviewDto);
  }

  @Get(":productId")
  getAllByProductId(
    @Param("productId") productId: string,
    @Query() params: GetReviewsByProductParams
  ) {
    return this.reviewsService.getAllByProductId(productId, params);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(":id")
  deleteOneById(@Param("id") id: string, @UseUser() user: IUserPayload) {
    return this.reviewsService.deleteOneById(id, user.userId);
  }
}
