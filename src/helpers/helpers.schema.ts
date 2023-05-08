import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsOptional } from "class-validator";

@Schema()
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

export class QueryModelPosts {
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




