import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'

import { SessionController } from './session.controller'
import { SessionService } from './session.service'

@Module({
  imports: [PrismaModule],
  providers: [SessionService],
  exports: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
