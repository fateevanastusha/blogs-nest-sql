import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../blogs/blogs.repository";
import { BlogViewModel } from "../../blogs/blogs.schema";



export class GetBlogBlogsCommand {
  constructor(public blogId: string) {}
}
@CommandHandler(GetBlogBlogsCommand)
export class GetBlogUseCase implements ICommandHandler<GetBlogBlogsCommand>{
  constructor(private blogsRepository : BlogsRepository) {}
  async execute (command : GetBlogBlogsCommand) : Promise<BlogViewModel>{
    const blog = await this.blogsRepository.getFullBlog(command.blogId);
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