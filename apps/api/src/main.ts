import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import env from './env';
import { ServiceTokenGuard } from './guards/auth.guard';
import { RequestsInterceptor } from './logging-interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Tesseract')
    .setDescription('The Tesseract API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.setGlobalPrefix('/api/v1');
  app.useGlobalGuards(new ServiceTokenGuard());
  app.useGlobalInterceptors(new RequestsInterceptor());
  await app.listen(env.PORT ?? 3000);
}
bootstrap();
