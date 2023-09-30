import { ApiProperty } from "@nestjs/swagger";

export class AuthResponse {
  @ApiProperty({
    example: {
      id: "1",
      username: "admin",
      email: "admin@gmail.com",
    },
  })
  user: {
    id: string;
    username: string;
    email: string;
  };

  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTE3YjlhY2U0Yjc3YjMxMmU5NTEyYmYiLCJ1c2VybmFtZSI6ImFkbWluMTAiLCJpYXQiOjE2OTYwNTM2NzYsImV4cCI6MTY5NjY1ODQ3Nn0.zAyWSQMFpHRpQYOlKURZ2P9rZ7NU8KWvg6jRT2K9c5I",
  })
  accessToken: string;
}

export class RefreshTokenResponse {
  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTE3YjlhY2U0Yjc3YjMxMmU5NTEyYmYiLCJ1c2VybmFtZSI6ImFkbWluMTAiLCJpYXQiOjE2OTYwNTM2NzYsImV4cCI6MTY5NjY1ODQ3Nn0.zAyWSQMFpHRpQYOlKURZ2P9rZ7NU8KWvg6jRT2K9c5I",
  })
  accessToken: string;
}
