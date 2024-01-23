import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile
} from "@nestjs/common";
import {
  FilesInterceptor,
  FileInterceptor,
  FileFieldsInterceptor
} from "@nestjs/platform-express";
import { ApiTags, ApiOkResponse } from "@nestjs/swagger";
import { fileStorage } from "../files/storage";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { UsersResponse } from "./types";
import { UseUser } from "../decorators/use-user.decorator";

import { Express } from "express";

interface IAccessTokenPayload {
  userId: string;
  username: string;
}

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOkResponse({ type: UsersResponse })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @Get("products")
  getMyProducts(@Req() req, @UseUser() user) {
    return this.usersService.getMyProducts(user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne({ id });
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @HttpCode(204)
  @Delete()
  removeAll() {
    return this.usersService.removeAll();
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(AccessTokenGuard)
  @Post("update-avatar")
  @UseInterceptors(FileInterceptor("avatar", { storage: fileStorage }))
  updateAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @UseUser() user: IAccessTokenPayload
  ) {
    return this.usersService.updateAvatar(avatar, user.userId);
  }
}
