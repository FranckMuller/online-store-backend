import { ApiProperty } from "@nestjs/swagger";

type Category = {
  id: string;
  name: string;
  title: {
    en: string;
    ru: string;
  };
  icon: string;
};

export class GetAllGategoriesResponse {
  @ApiProperty({
    example: [
      {
        id: 1,
        name: "home",
        title: {
          en: "Home",
          ru: "Дом",
        },
        icon: "icon",
      },
    ],
  })
  categories: Array<Category>;
}

export class CreateCategoryResponse {
  @ApiProperty({
    example: {
      id: 1,
      name: "home",
      title: {
        en: "Home",
        ru: "Дом",
      },
      icon: "icon",
    },
  })
  category: Category;
}

export class DeleteCategoryResponse {
  @ApiProperty({
    example: "1",
  })
  id: string;
}
