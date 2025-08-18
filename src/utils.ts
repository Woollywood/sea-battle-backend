import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Trello')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  })
}

export const getAccessTokenFromHeader = (value: string) =>
  value.replace('Bearer', '').trim()
