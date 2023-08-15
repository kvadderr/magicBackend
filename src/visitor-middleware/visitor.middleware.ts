import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VisitorMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const clientIp =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (clientIp.toString().split(':').at(-1) === '1') {
      req.clientIp = '127.0.0.1';
    } else {
      req.clientIp = clientIp.toString().split(':').at(-1);
    }

    const currentDate = new Date();

    // Преобразование к формату DD.MM.YY
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = String(currentDate.getFullYear()).slice(-2);

    const formattedDate = `${day}.${month}.${year}`;

    const user = await this.prisma.visitors.findFirst({
      where: {
        sortDate: formattedDate,
        ip: req.clientIp,
      },
    });

    if (!user) {
      await this.prisma.visitors.create({
        data: {
          ip: req.clientIp,
          sortDate: formattedDate,
          sortedMonth: month,
        },
      });
    }
    next();
  }
}
