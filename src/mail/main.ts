import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "../exception.filters";
import { useContainer } from "class-validator";
import { createApp } from "../../test/create.app";
var cookieParser = require('cookie-parser')

async function bootstrap() {
  const appRaw = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('blogs')
    .setDescription('')
    .setVersion('1.0')
    .addTag('blogs')
    .build();
  const app = createApp(appRaw)
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(3000);
}
bootstrap();
