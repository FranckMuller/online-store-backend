import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Res,
  Req,
} from "@nestjs/common";
import type { Response, Request } from "express";
import { ApiTags, ApiBody, ApiOkResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto, SigninDto } from "./dto/auth.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { AuthResponse, RefreshTokenResponse } from "./types";

// HttpStatus

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: AuthResponse })
  @Post("signup")
  signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signup(createUserDto, res);
  }

  @ApiOkResponse({ type: AuthResponse })
  @Post("signin")
  signin(
    @Body() signinDto: SigninDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signin(signinDto, res);
  }

  @HttpCode(204)
  @Post("signout")
  signout(@Res({ passthrough: true }) res: Response) {
    return this.authService.signout(res);
  }
  
@ApiOkResponse({type: RefreshTokenResponse})
  @Get("refresh/:userId")
  refreshToken(@Param("userId") userId: string, @Req() req: Request) {
    return this.authService.refreshToken(userId, req);
  }
}
