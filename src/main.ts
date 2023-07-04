import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './core/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'https://api.steampowered.com',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('OOP project')
    .setDescription('The backend Node API description')
    .setVersion('1.0.1')
    .addTag('Dartar')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(PORT);
}
bootstrap();
