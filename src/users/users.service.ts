import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./schemas/user.schema";
import { ProductsService } from "../products/products.service";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // TODO check if user already exist
  async create(createUserDto: CreateUserDto) {
    const roles = createUserDto.username === 'admin' ? ["user", "admin"] : ['user']
    const user = new this.userModel({
      ...createUserDto,
      roles
    });

    await user.save();

    return user;
  }

  async findAll() {
    const users = await this.userModel
      .find({})
      .select("id username email avatarMini");
    
    return users;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    return user
  }
  
  async findByIdWithException(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
  
  

  async findOne(filter) {
    const user = await this.userModel.findOne({
      $or: [
        { _id: { $eq: filter.id } },
        { username: { $eq: filter.username } },
        { email: { $eq: filter.email } }
      ]
    });

    if (!user) throw new NotFoundException("user not found");

    return user;
  }

  async updateAvatar(avatar, userId) {
    const user = await this.findOne({ id: userId });
    user.avatar = `/${avatar.path}`;
    user.avatarMini = `/${avatar.path}`;

    const result = await user.save();
    return result.avatarMini;
  }

  async getMyProducts(userId: string) {
    const user = this.userModel.findById(userId).populate("products");
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async removeAll() {
    return await this.userModel.deleteMany({});
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateRefreshToken(userId, refreshToken) {
    const user = await this.findById(userId);
    user.refreshToken = refreshToken;
    await user.save();
    return user;
  }

  async checkExistWithException(filter) {
    const user = await this.userModel.findOne({
      $or: [
        { _id: { $eq: filter.id } },
        { username: { $eq: filter.username } },
        { email: { $eq: filter.email } }
      ]
    });

    if (user) throw new ConflictException("user already exists");
  }
}
