import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
  @IsNotEmpty()
  @ApiProperty({ example: "home" })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    example: {
      en: "Home",
      ru: "Дом",
    },
  })
  title: {
    en: string;
    ru: string;
  };

  @IsNotEmpty()
  @ApiProperty({example: 'icon'})
  icon: string;
}
