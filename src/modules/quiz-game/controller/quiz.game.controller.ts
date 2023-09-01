import { Controller, DefaultValuePipe, Get, Query, Req } from '@nestjs/common';

@Controller('quiz/questions')
export class QuizGameController {

  @Get()
  async getQuestions(@Query('pageSize', new DefaultValuePipe(10)) pageSize : number,
                 @Query('pageNumber', new DefaultValuePipe(1)) pageNumber : number,
                 @Query('sortBy', new DefaultValuePipe('createdAt')) sortBy : string,
                 @Query('sortDirection', new DefaultValuePipe('desc')) sortDirection : "asc" | "desc",
                 @Query('bodySearchTerm', new DefaultValuePipe('')) bodySearchTerm : string,
                     @Query('publishedStatus', new DefaultValuePipe('all')) publishedStatus :  "all" | "published" | "notPublished",
                 @Req() req: any
  ){
    const query = {
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
      bodySearchTerm,
      publishedStatus
    }
  }
}