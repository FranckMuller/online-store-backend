import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class SigninDto {
  @ApiProperty({ example: "admin@gmail.com" })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "admin" })
  @IsNotEmpty()
  password: string;
}
