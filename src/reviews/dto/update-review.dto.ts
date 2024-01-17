import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateReviewDto {
  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({
    example:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Labore eaque consequuntur reiciendis excepturi itaque autem perspiciatis vel aut, dolores error odit, dicta nam ut deserunt distinctio ex facere quisquam dolore."
  })
  text: string;
}
