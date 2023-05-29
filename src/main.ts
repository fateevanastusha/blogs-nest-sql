import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { createApp } from "../test/create.app";
import { AppModule } from "./app.module";
async function bootstrap() {
  const appRaw = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('bloggers')
    .setDescription('')
    .setVersion('1.0')
    .addTag('bloggers')
    .build();
  const app = createApp(appRaw)
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(3000);
}
bootstrap();
