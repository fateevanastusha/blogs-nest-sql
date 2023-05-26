import { ValidationArguments, ValidatorConstraintInterface } from "class-validator";
import { BloggersRepository } from "../api/blogger/bloggers/bloggers.repository";

export class BlogExists implements ValidatorConstraintInterface {
  constructor(protected blogsRepository : BloggersRepository) { }

  async validate(id : string) {
    const blog = this.blogsRepository.getBlog(id)
    if (!blog) return false
    return true
  }
  defaultMessage(args : ValidationArguments): string {
    return `Blog doesn't exist`
  }
}