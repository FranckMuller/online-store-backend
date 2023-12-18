import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "./schemas/category.schema";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>
  ) {}

  async getAll() {
    const result = await this.categoryModel.find({});
    return result;
  }

  async createOne(createCategoryDto) {
    const result = await this.categoryModel.create(createCategoryDto);
    return result;
  }

  async deleteOne(id) {
    const result = await this.categoryModel.findByIdAndDelete(id);
    return result.id;
  }

  async findByName(name) {
    const foundCategory = await this.categoryModel.findOne({ name });
    if (foundCategory) {
      return foundCategory;
    } else {
      throw new NotFoundException('category does not exist');
    }
  }
}
