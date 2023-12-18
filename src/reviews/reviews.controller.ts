import {Controller, Get, Post, Delete, Body, Param} from '@nestjs/common'
import {ReviewsService} from './reviews.service'

@Controller('reviews')
export class ReviewsController{
  constructor(private readonly reviewsService: ReviewsService){}
  @Get()
  getAll() {
    return this.reviewsService.getAll()
  }
  
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto)
  }
  
  @Get(':productId')
  getAllByProductId(@Param('productId') productId: string){
    return this.reviewsService.getAllByProductId(productId)
  }
  
  @Delete(':id')
  deleteOneById(@Param('id') id: string) {
    return this.reviewsService.deleteOneById(id)
  }
}