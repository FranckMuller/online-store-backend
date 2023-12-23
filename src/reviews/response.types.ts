import {ApiProperty } from "@nestjs/swagger"

export class ReviewResponse {
  @ApiProperty({example: '1'})
  id: string
  
  @ApiProperty({example: 5})
  rating: number
  
  @ApiProperty({example: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab autem natus voluptates ex ratione illo ad! Amet voluptates porro, recusandae, vel repellendus, saepe fuga ipsum odio quis ex voluptate obcaecati.'})
  text: string
}