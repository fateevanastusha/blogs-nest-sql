import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../public/blogs/blogs.repository";
import { BlogModel, BlogViewModel } from "../../public/blogs/blogs.schema";
import { NotFoundException } from "@nestjs/common";


export class GetBlogBlogsCommand {
  constructor(public blogId: string) {}
}
@CommandHandler(GetBlogBlogsCommand)
export class GetBlogUseCase implements ICommandHandler<GetBlogBlogsCommand>{
  constructor(private blogsRepository : BlogsRepository) {}
  async execute (command : GetBlogBlogsCommand) : Promise<BlogViewModel>{
    const findBlog : BlogModel[] = await this.blogsRepository.getFullBlog(command.blogId);
    if(findBlog.length === 0) throw new NotFoundException();
    const blog : BlogModel = findBlog[0];
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