import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePageDto } from './dto/createPage.dto';

@Injectable()
export class CustompageService {
  constructor(private readonly prisma: PrismaService) {}

  async createPage(dto: CreatePageDto) {
    const candidate = await this.prisma.urlSettings.findFirst({
      where: {
        url: dto.url,
      },
    });

    if (candidate) {
      throw new HttpException(
        'Страница с данным URL уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newPage = await this.prisma.urlSettings.create({
      data: {
        icon: dto.mainIcon,
        sections: JSON.parse(JSON.stringify(dto.items)),
        isHaveSidebar: dto.isHaveSidebar,
        url: dto.url,
        text: dto.mainTitle,
      },
    });

    return newPage;
  }

  async getPageByUrl(id: number) {
    const page = await this.prisma.urlSettings.findFirst({
      where: {
        id,
      },
    });

    if (page.hidden) {
      throw new HttpException('Страница недоступна', HttpStatus.FORBIDDEN);
    }
    return page;
  }

  async updPage(dto: CreatePageDto) {
    const candidate = await this.prisma.urlSettings.findFirst({
      where: {
        url: dto.url,
      },
    });

    if (!candidate) {
      throw new HttpException(
        'Страница с данным URL не существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updPage = await this.prisma.urlSettings.update({
      where: {
        id: candidate.id,
      },
      data: {
        icon: dto.mainIcon,
        sections: JSON.parse(JSON.stringify(dto.items)),
        isHaveSidebar: dto.isHaveSidebar,
        url: dto.url,
        text: dto.mainTitle,
      },
    });
  }

  async deletePage(url: string) {
    const candidate = await this.prisma.urlSettings.findFirst({
      where: {
        url: url,
      },
    });

    if (!candidate) {
      throw new HttpException(
        'Страница с данным URL не существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.urlSettings.delete({
      where: {
        id: candidate.id,
      },
    });

    return 'Страница удалена';
  }

  async getAll() {
    return this.prisma.urlSettings.findMany({
      where: {
        hidden: false,
        typeUrl: 'CUSTOM_PAGE',
      },
      select: {
        icon: true,
        id: true,
        isHaveSidebar: true,
        url: true,
        typeUrl: true,
      },
    });
  }
}
