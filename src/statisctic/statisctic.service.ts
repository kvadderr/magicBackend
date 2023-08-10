import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class StatiscticService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfit(startDate: Date, endDate: Date) {
    const profit = await this.prisma.purchase.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        lostMainBalance: true,
      },
    });

    return {
      profit: profit._sum.lostMainBalance,
    };
  }

  async profitToday() {
    const currentDate = new Date(); // Получаем текущую дату
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999); // Устанавливаем время на конец дня

    return this.getProfit(startOfDay, endOfDay);
  }

  async profitLast30Days() {
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    console.log(startDate, endDate);

    return this.getProfit(startDate, endDate);
  }

  async profitInThisMonth() {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );

    return this.getProfit(startOfMonth, currentDate);
  }

  async ProfitAllTime() {
    const result = await this.prisma.purchase.aggregate({
      _sum: {
        lostMainBalance: true,
      },
    });
    return {
      profit: result._sum.lostMainBalance,
    };
  }

  //TODO: Найти способ группировать по дням. В настоящее время в призме нет вариантов реализации
  async profitPerDay() {
    const timeOfFirstPurchase = `${
      (await this.prisma.purchase.findFirst()).createdAt
    }`;

    const date = new Date(timeOfFirstPurchase);

    const groupedPurchases = await this.prisma.purchase.groupBy({
      by: ['dateOfPurchase'],
      orderBy: {
        dateOfPurchase: 'asc',
      },
      _sum: {
        lostMainBalance: true,
      },
    });

    return groupedPurchases;
  }

  async ProfitRandomDate(startDate: Date, endDate: Date, token: string) {
    return this.getProfit(startDate, endDate);
  }

  async avarageDeposit(token: string) {
    const avarageDeposit = await this.prisma.transaction.aggregate({
      _avg: {
        amount: true,
      },
    });

    return {
      avarageDeposit: avarageDeposit._avg.amount,
    };
  }

  async avarageDepositPerUser() {
    //@ts-ignore //TODO: как группировать по дате?
    /* const result = await this.prisma.transaction.groupBy({
      by: ['user', Prisma.date({ part: 'month', value: 'createdAt' })],
      _count: {
        amount: true,
      },
      where: {
        method: 'deposit',
      },
    });

    const userMonthlyDeposits = result.map((item) => ({
      userId: item.user.id,
      month: item.createdAt,
      depositCount: item._count.amount,
    })); */
  }
}
