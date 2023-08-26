import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VisitorMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.headers['x-real-ip'];

    req.clientIp = clientIp.toString();

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
          ip: clientIp.toString(),
          sortDate: formattedDate,
          sortedMonth: month,
        },
      });
    }
    next();
  }
}
