import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import env from './env';
import { ServiceTokenGuard } from './guards/auth.guard';
import fs from 'fs';
async function bootstrap() {
  const options =
    env.APP_ENV === 'local'
      ? undefined
      : {
          httpsOptions: {
            key: fs.readFileSync(env.SSL_PATH + '/key,pem'),
            cert: fs.readFileSync(env.SSL_PATH + '/cert,pem'),
          },
        };
  const app = await NestFactory.create(AppModule, options);
  const config = new DocumentBuilder()
    .setTitle('Tesseract')
    .setDescription('The Tesseract API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.setGlobalPrefix('/api/v1');
  app.useGlobalGuards(new ServiceTokenGuard());
  await app.listen(env.PORT ?? 3000);
}
bootstrap();
