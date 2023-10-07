import * as bcrypt from "bcryptjs";
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";

interface IDecodedToken {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

const cookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 24 * 7 * 60 * 60 * 1000,
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signup(createUserDto, res) {
    const userExist = await this.usersService.findOne(createUserDto);

    if (userExist) {
      throw new ConflictException(
        "user with this email or username already exist"
      );
    }

    try {
      const hashedPassword = this.hashData(createUserDto.password);
      const data = {
        ...createUserDto,
        password: hashedPassword,
      };
      const createdUser = await this.usersService.create(data);

      const { accessToken, refreshToken } = await this.generateTokens(
        createdUser.id,
        createdUser.username
      );

      const hashedRefreshToken = this.hashData(refreshToken);

      const user = await this.usersService.updateRefreshToken(
        createdUser.id,
        hashedRefreshToken
      );

      res.cookie("jwt", refreshToken, cookieConfig);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
        accessToken,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async signin(signinDto, res) {
    const user = await this.usersService.findOne(signinDto);

    if (!user) throw new NotFoundException("user does not exists");

    const matchPassword = await bcrypt.compare(
      signinDto.password,
      user.password
    );

    if (!matchPassword)
      throw new ForbiddenException("email or password are not correct");

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.username
    );

    const hashedRefreshToken = this.hashData(refreshToken);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    res.cookie("jwt", refreshToken, cookieConfig);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
      accessToken,
    };
  }

  async signout(res, userId) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new ForbiddenException();
    await this.usersService.updateRefreshToken(userId, null);
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  }

  async refreshToken(userId, req) {
    if (req.cookies.jwt) {
      const user = await this.usersService.findOne({ id: userId });
      if (!user) throw new ForbiddenException();

      const matchToken = await bcrypt.compare(
        req.cookies.jwt,
        user.refreshToken
      );
      if (!matchToken) throw new ForbiddenException();

      const { accessToken } = await this.generateTokens(user.id, user.username);
      return { accessToken };
    } else {
      throw new ForbiddenException();
    }
  }

  async checkAuth(authHeader: string) {
    const token = authHeader.split(" ")[1];
    const decoded = this.jwtService.decode(token) as IDecodedToken;
    console.log(decoded);
    const user = await this.usersService.findById(decoded.userId);
    if (!user) throw new UnauthorizedException();

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  private async generateTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
          username,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: "7d",
        }
      ),

      this.jwtService.signAsync(
        {
          userId,
          username,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: "7d",
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashData(data: string) {
    return bcrypt.hashSync(data, 10);
  }
}
