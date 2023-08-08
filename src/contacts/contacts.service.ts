import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.baseSettings.findFirst({
      where: {
        id: 2,
      },
      select: {
        panelURLs: true,
      },
    });
  }
}
