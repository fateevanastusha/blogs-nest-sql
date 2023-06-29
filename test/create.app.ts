import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "../src/exception.filters";
import { useContainer } from "class-validator";
import cookieParser from 'cookie-parser';

export const createApp = (app: INestApplication): INestApplication => {
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError : true
  }))
  app.useGlobalFilters(new HttpExceptionFilter())
  app.enableCors()
  useContainer(app.select(AppModule), {fallbackOnErrors: true})
  return app
};