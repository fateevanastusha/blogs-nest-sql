import { QueryModelBlogs } from "../../helpers/helpers.schema";
import { Injectable } from "@nestjs/common";
import { BlogModel, PaginatedClass } from "./blogs.schema";
import { BlogsRepository } from "./blogs.repository";
import { QueryRepository } from "../../helpers/query.repository";

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository : BlogsRepository, protected queryRepository : QueryRepository) {
  }
  async getBlogs(query : QueryModelBlogs): Promise<PaginatedClass>{
    const total = await this.blogsRepository.getBlogsCount(query.searchNameTerm)
    const pageCount = Math.ceil( total / +query.pageSize)
    const items : BlogModel[] = await this.queryRepository.paginationForBlogs(query);
    const mappedItems = items.map(a => {
      return {
        createdAt: a.createdAt,
        description: a.description,
        id: a.id + '',
        isMembership: a.isMembership,
        name: a.name,
        websiteUrl: a.websiteUrl
      }
    })
    return await this.queryRepository.paginationForm(pageCount, total, mappedItems, query)
  }
}