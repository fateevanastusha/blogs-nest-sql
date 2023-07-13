import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../repository/blogs.repository";
import { BlogViewModel } from "../schemas/blogs.schema";
import { NotFoundException } from '@nestjs/common';



export class GetBlogBlogsCommand {
  constructor(public blogId: string) {}
}
@CommandHandler(GetBlogBlogsCommand)
export class GetBlogUseCase implements ICommandHandler<GetBlogBlogsCommand>{
  constructor(private blogsRepository : BlogsRepository) {}
  async execute (command : GetBlogBlogsCommand) : Promise<BlogViewModel>{
    const blog = await this.blogsRepository.getFullBlog(command.blogId);
    if(blog.isBanned) throw new NotFoundException();
    const mappedBlog : BlogViewModel = {
      id : blog.id + '',
      name : blog.name,
      description : blog.description,
      websiteUrl : blog.websiteUrl,
      createdAt : blog.createdAt,
      isMembership : blog.isMembership
    };
    return mappedBlog;
  }
}