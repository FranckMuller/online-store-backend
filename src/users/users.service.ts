import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // TODO check if user already exist
  async create(createUserDto: CreateUserDto) {
    // new userModel .save()
    const user = new this.userModel(createUserDto);
    await user.save();
    console.log(user);
    return user;
  }

  async findAll() {
    const users = await this.userModel.find({});

    return users;
  }

  async findById(id) {
    return await this.userModel.findById(id);
  }

  async findOne(filter) {
    console.log(filter);
    const user = await this.userModel.findOne({
      $or: [
      {_id: {$eq: filter.id}},
        { username: { $eq: filter.username } },
        { email: { $eq: filter.email } },
      ],
    });

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
}
