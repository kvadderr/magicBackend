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
        refund: false,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        lostMainBalance: true,
      },
    });

    return profit._sum.lostMainBalance;
  }

  async profitToday() {
    const currentDate = new Date(); // Получаем текущую дату
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999); // Устанавливаем время на конец дня

    return { profit: this.getProfit(startOfDay, endOfDay), date: currentDate };
  }

  async profitLast30Days() {
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    console.log(startDate, endDate);

    return { profit: this.getProfit(startDate, endDate), startDate, endDate };
  }

  async profitInThisMonth() {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );

    return {
      profit: this.getProfit(startOfMonth, currentDate),
      startOfMonth,
      currentDate,
    };
  }

  async ProfitAllTime() {
    const result = await this.prisma.purchase.aggregate({
      where: {
        refund: false,
      },
      _sum: {
        lostMainBalance: true,
      },
    });
    return {
      profit: result._sum.lostMainBalance,
    };
  }

  async profitPerDay() {
    const timeOfFirstPurchase = `${
      (await this.prisma.purchase.findFirst()).createdAt
    }`;

    const date = new Date(timeOfFirstPurchase);

    const groupedPurchases = await this.prisma.purchase.groupBy({
      by: ['dateOfPurchase'],
      where: {
        refund: false,
      },
      orderBy: {
        dateOfPurchase: 'asc',
      },
      _sum: {
        lostMainBalance: true,
      },
    });

    return groupedPurchases;
  }

  async ProfitRandomDate(startDate: Date, endDate: Date) {
    return { profit: this.getProfit(startDate, endDate), startDate, endDate };
  }

  async avarageDeposit() {
    const avarageDeposit = await this.prisma.transaction.aggregate({
      where: {
        status: 'SUCCESS',
      },
      _avg: {
        amount: true,
      },
    });

    return {
      avarageDeposit: avarageDeposit._avg.amount,
    };
  }

  async avarageDepositPerUser() {
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    console.log(startDate, endDate);

    const averageDepositsPerMonth = await this.prisma.transaction.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        createdAt: true,
      },
    });

    let countOfDeposits = 0;
    averageDepositsPerMonth.forEach((record) => {
      countOfDeposits += record._count.createdAt;
    });
    return {
      avgCount: countOfDeposits / averageDepositsPerMonth.length,
      startDate,
      endDate,
    };
  }

  async profitOnServer() {
    const servers = await this.prisma.server.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const profitServers = await Promise.all(
      servers.map(async (server) => {
        const products = await this.prisma.inventory.findMany({
          where: {
            status: 'ON_SERVER',
            serverId: server.id,
          },
          include: {
            purchase: true,
          },
        });

        let profit = 0;
        let countOfPartPacks = 0;

        products.forEach((el) => {
          if (el.isPartOfPack) {
            if (countOfPartPacks == 0) {
              profit += el.purchase.lostMainBalance;
            }
            countOfPartPacks++;
          } else {
            profit += el.purchase.lostMainBalance;
            countOfPartPacks = 0;
          }
        });

        return { serverName: server.name, profit };
      }),
    );

    return profitServers;
  }

  async profitPerServerOnRandomDate(startDate: string, endDate: string) {
    const servers = await this.prisma.server.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const correctStartDate = new Date(startDate);
    const correctEndDate = new Date(endDate);

    const profitServers = await Promise.all(
      servers.map(async (server) => {
        const products = await this.prisma.inventory.findMany({
          where: {
            status: 'ON_SERVER',
            serverId: server.id,
            purchase: {
              createdAt: {
                gte: correctStartDate,
                lte: correctEndDate,
              },
            },
          },
          include: {
            purchase: true,
          },
        });

        let profit = 0;
        let countOfPartPacks = 0;

        products.forEach((el) => {
          if (el.isPartOfPack) {
            if (countOfPartPacks == 0) {
              profit += el.purchase.lostMainBalance;
            }
            countOfPartPacks++;
          } else {
            profit += el.purchase.lostMainBalance;
            countOfPartPacks = 0;
          }
        });

        return { serverName: server.name, profit };
      }),
    );

    return profitServers;
  }

  async profitPerItem() {
    const items = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const profit = await Promise.all(
      items.map(async (item) => {
        const purchases = await this.prisma.purchase.aggregate({
          where: {
            refund: false,
            productId: item.id,
          },
          _sum: {
            lostMainBalance: true,
          },
        });
        return { item: item.name, profit: purchases._sum.lostMainBalance };
      }),
    );
    return profit;
  }

  async profitPerItemOnRandomDate(
    startDate: string,
    endDate: string,
    serverId?: number,
  ) {
    const correctStartDate = new Date(startDate);
    const correctEndDate = new Date(endDate);

    if (serverId) {
      const server = await this.prisma.server.findFirstOrThrow({
        where: {
          id: serverId,
        },
      });
      const items = await this.prisma.product.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      const profit = await Promise.all(
        items.map(async (item) => {
          const purchases = await this.prisma.purchase.aggregate({
            where: {
              refund: false,
              productId: item.id,
              createdAt: {
                gte: correctStartDate,
                lte: correctEndDate,
              },
            },
            _sum: {
              lostMainBalance: true,
            },
          });
          return { item: item.name, profit: purchases._sum.lostMainBalance };
        }),
      );
      return profit;
    }

    const items = await this.prisma.product.findMany();

    const profit = await Promise.all(
      items.map(async (item) => {
        const purchases = await this.prisma.purchase.aggregate({
          where: {
            refund: false,
            productId: item.id,
            createdAt: {
              gte: correctStartDate,
              lte: correctEndDate,
            },
          },
          _sum: {
            lostMainBalance: true,
          },
        });
        return { item: item.name, profit: purchases._sum.lostMainBalance };
      }),
    );
    return profit;
  }

  async countOfProducts() {
    const items = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const counter = await Promise.all(
      items.map(async (item) => {
        const purchasesAndCount = await this.prisma.purchase.aggregate({
          where: {
            refund: false,
            productId: item.id,
          },
          _sum: {
            amount: true,
          },
        });

        return { item: item.name, amount: purchasesAndCount._sum.amount };
      }),
    );

    return counter;
  }

  async countOfProductsByRandomDate(startDate: string, endDate: string) {
    const correctStartDate = new Date(startDate);
    const correctEndDate = new Date(endDate);

    const items = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const counter = await Promise.all(
      items.map(async (item) => {
        const purchasesAndCount = await this.prisma.purchase.aggregate({
          where: {
            refund: false,
            productId: item.id,
            createdAt: {
              gte: correctStartDate,
              lte: correctEndDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        return { item: item.name, amount: purchasesAndCount._sum.amount };
      }),
    );

    return counter;
  }
}
