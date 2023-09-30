import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "admin" })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: "admin@gmail.com" })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "admin" })
  @IsNotEmpty()
  password: string;
}
