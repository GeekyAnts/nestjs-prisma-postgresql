import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFile } from 'fs/promises';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const configService = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [configService.get('app.version', '1')],
  });

  const options = new DocumentBuilder()
    .setTitle('Project Name')
    .setDescription('Poject Description description')
    .setVersion('1.0')
    .addTag('Project Tag')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);

  await writeFile(`./storage/api-docs.json`, JSON.stringify(document, null, 2));

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });

  await app.listen(configService.get<number>('app.port', 3000));
}
bootstrap();
