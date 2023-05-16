import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./exception.filters";
import { useContainer } from "class-validator";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('blogs')
    .setDescription('')
    .setVersion('1.0')
    .addTag('blogs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  app.useGlobalPipes(new ValidationPipe({
    stopAtFirstError : true
  }))
  app.useGlobalFilters(new HttpExceptionFilter())
  app.enableCors()
  useContainer(app.select(AppModule), {fallbackOnErrors: true})
  await app.listen(3000);
}
bootstrap();
