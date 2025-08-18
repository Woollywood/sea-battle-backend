import { Injectable } from '@nestjs/common'
import { hash, verify } from 'argon2'
import { PageDto } from 'src/common/dto/page.dto'
import { PageMetaDto } from 'src/common/dto/pageMeta.dto'
import { PageOptionsDto } from 'src/common/dto/pageOptions.dto'
import { CreateUserDto } from 'src/generated/user/dto/create-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  comparePassword(encryptedPassword: string, password: string) {
    return verify(encryptedPassword, password)
  }

  async listUsers(pageOptionsDto: PageOptionsDto) {
    const { search, skip, order, take } = pageOptionsDto
    const [entities, entitiesCount] = await Promise.all([
      this.prismaService.user.findMany({
        where: {
          username: { contains: search, mode: 'insensitive' },
        },
        skip,
        orderBy: { createdAt: order },
        take,
      }),
      this.prismaService.user.count({
        where: {
          username: { contains: search, mode: 'insensitive' },
        },
      }),
    ])

    const pageMetaDto = new PageMetaDto({
      itemCount: entitiesCount,
      pageOptionsDto,
    })
    return new PageDto(entities, pageMetaDto)
  }

  async createUser(dto: CreateUserDto) {
    const password = await hash(dto.password)
    return this.prismaService.user.create({
      data: { ...dto, password },
    })
  }

  findById(id: string) {
    return this.prismaService.user.findUnique({ where: { id } })
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } })
  }

  findByUsername(username: string) {
    return this.prismaService.user.findUnique({ where: { username } })
  }
}
