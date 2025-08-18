import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { setupSwagger } from './utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<string>('PORT') ?? 3000
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  })
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  setupSwagger(app)

  await app.listen(port)
}

void bootstrap()
