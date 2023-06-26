import { QueryModelBlogs } from "../../../helpers/helpers.schema";
import { Injectable } from "@nestjs/common";
import { BlogModel, PaginatedClass } from "./blogs.schema";
import { BlogsRepository } from "./blogs.repository";
import { QueryRepository } from "../../../helpers/query.repository";
import { loginURI } from "../../../test-utils/test.strings";

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
        blogOwnerInfo: {
          userId: a.userId,
          userLogin: a.userLogin
        },
        "createdAt": a.createdAt,
        "description": a.description,
        "id": a.id,
        "isMembership": a.isMembership,
        "name": a.name,
        "banInfo": {
          banDate : a.banDate,
          isBanned : a.isBanned
        },
        "websiteUrl": a.websiteUrl
      }
    })
    return await this.queryRepository.paginationForm(pageCount, total, mappedItems, query)
  }
  async getBlog(id: string) : Promise<BlogModel | null>{
    return (await this.blogsRepository.getBlog(id))[0]
  }
  async deleteAllData(){
    await this.blogsRepository.deleteAllData()
  }
}