import { Prop, Schema } from "@nestjs/mongoose";
import { IsOptional } from "class-validator";

export class QueryModel {
  @IsOptional()
  @Prop({ default: 10 })
  pageSize?: number = 10

  @IsOptional()
  @Prop({ default: 1 })
  pageNumber?: number = 1

  @IsOptional()
  @Prop({ default: "createdAt" })
  sortBy?: string = 'createdAt'

  @IsOptional()
  @Prop({ default: 'asc'})
  sortDirection?: "asc" | "desc" = 'asc'
}

export class QueryModelBlogs {
  @IsOptional()
  @Prop({ default: 10 })
  pageSize?: number = 10

  @IsOptional()
  @Prop({ default: 1 })
  pageNumber?: number = 1

  @IsOptional()
  @Prop({ default: "createdAt" })
  sortBy?: string = 'createdAt'

  @IsOptional()
  @Prop({ default: 'asc'})
  sortDirection?: "asc" | "desc" = 'asc'

  @IsOptional()
  @Prop({ default: "" })
  searchNameTerm?: string = ''
}

export class QueryModelUsers {
  @IsOptional()
  @Prop({ default: 10 })
  pageSize?: number = 10

  @IsOptional()
  @Prop({ default: 1 })
  pageNumber?: number = 1

  @IsOptional()
  @Prop({ default: "createdAt" })
  sortBy?: string = 'createdAt'

  @IsOptional()
  @Prop({ default: 'asc'})
  sortDirection?: "asc" | "desc" = 'asc'

  @IsOptional()
  @Prop({ default: "" })
  searchLoginTerm?: string = ''

  @IsOptional()
  @Prop({ default: "" })
  searchEmailTerm?: string = ''

  @IsOptional()
  @Prop({ default: undefined })
  banStatus?: any
}

export class QueryModelBannedUsersForBlog {
  @IsOptional()
  @Prop({ default: 10 })
  pageSize?: number = 10

  @IsOptional()
  @Prop({ default: 1 })
  pageNumber?: number = 1

  @IsOptional()
  @Prop({ default: "banDate" })
  sortBy?: string = 'banDate'

  @IsOptional()
  @Prop({ default: 'asc'})
  sortDirection?: "asc" | "desc" = 'asc'

  @IsOptional()
  @Prop({ default: "" })
  searchLoginTerm?: string = ''
}

export class QueryCommentsUsers {
  @IsOptional()
  @Prop({ default: 10 })
  pageSize?: number = 10

  @IsOptional()
  @Prop({ default: 1 })
  pageNumber?: number = 1

  @IsOptional()
  @Prop({ default: "createdAt" })
  sortBy?: string = 'createdAt'

  @IsOptional()
  @Prop({ default: 'asc'})
  sortDirection?: "asc" | "desc" = 'asc'

  @IsOptional()
  @Prop({ default: "" })
  searchLoginTerm?: string = ''

  @IsOptional()
  @Prop({ default: "" })
  searchEmailTerm?: string = ''
}




