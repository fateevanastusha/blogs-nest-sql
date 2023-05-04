import { QueryModelBlogs } from "../helpers/helpers.schema";
import { Injectable } from "@nestjs/common";
import { BlogModel, PaginatedClass } from "./blogs.schema";
import { BlogsRepository } from "./blogs.repository";
import { QueryRepository } from "../helpers/query.repository";
import { BlogDto } from "./blogs.dto";
@Injectable()
export class BlogsService {
  constructor(protected blogsRepository : BlogsRepository, protected queryRepository : QueryRepository) {
  }
  async getBlogs(query : QueryModelBlogs): Promise<PaginatedClass>{
    const total = await this.blogsRepository.getBlogsCount(query.searchNameTerm)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogModel[] = await this.queryRepository.paginationForBlogs(query);
    return await this.queryRepository.paginationForm(pageCount, total, items, query)
  }
  async getBlog(id: string) : Promise<BlogModel | null>{
    return await this.blogsRepository.getBlog(id)
  }
  async deleteBlog(id: string) : Promise<boolean>{
    return await this.blogsRepository.deleteBlog(id)
  }
  async createBlog(blog: BlogDto) : Promise<BlogModel | null>{
    const newBlog = {
      id: (+new Date()).toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMemberShip: false
    }
    // @ts-ignore
    return await this.blogsRepository.createBlog(newBlog);
  }
  async updateBlog(blog : BlogDto, id: string) : Promise <boolean>{
    return await this.blogsRepository.updateBlog(blog, id)
  }
  async deleteAllData(){
    await this.blogsRepository.deleteAllData()
  }
}