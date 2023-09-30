import { ApiProperty } from "@nestjs/swagger";

export class UsersResponse {
  @ApiProperty({ example: "1234" })
  id: string;
  
  @ApiProperty({ example: "admin" })
  username: string;
  
  @ApiProperty({ example: "admin@gmail.com" })
  email: string;
}
