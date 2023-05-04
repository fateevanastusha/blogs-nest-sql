import { ValidationArguments, ValidatorConstraintInterface } from "class-validator";
import { BlogsRepository } from "../blogs/blogs.repository";

export class BlogExists implements ValidatorConstraintInterface {
  constructor(protected blogsRepository : BlogsRepository) { }

  async validate(id : string) {
    const blog = this.blogsRepository.getBlog(id)
    if (!blog) return false
    return true
  }
  defaultMessage(args : ValidationArguments): string {
    return `Blog doesn't exist`
  }
}