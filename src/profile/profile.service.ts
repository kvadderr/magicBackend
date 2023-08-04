import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { retry } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly userSerivce: UsersService,
  ) {}

  async getInventory(token: string, page: number, count: number) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      if (!isUser) {
        throw new HttpException(
          'Пользователь не найден или срок действия токена истек',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userSerivce.findById(isUser.id);

      const result = await this.prisma.inventory.findMany({
        where: {
          userId: user.id,
          status: 'INVENTORY',
        },
        include: {
          product: true,
          serverType: true,
        },
      });
      result.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());
      return {
        result: result.slice((page - 1) * count, page * count),
        pages: result.length > count ? Math.ceil(result.length / count) : 1,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getDetalization(
    token: string,
    page: number,
    count: number,
    sort: string,
  ) {
    try {
      if (!sort) {
        throw new HttpException('Enter type of sort', HttpStatus.BAD_REQUEST);
      }
      const isUser = await this.tokenService.validateAccessToken(token);

      if (!isUser) {
        throw new HttpException(
          'Пользователь не найден',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userSerivce.findById(isUser.id);

      let transactions = await this.prisma.transaction.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      let purchases = await this.prisma.purchase.findMany({
        where: {
          userId: user.id,
        },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      let transfers = await this.prisma.transfers.findMany({
        where: {
          OR: [{ receiverId: user.id }, { senderId: user.id }],
        },
      });

      transactions = transactions.map((el) => {
        return { ...el, type: 'transaction' };
      });
      purchases = purchases.map((el) => {
        return { ...el, type: 'purchase' };
      });
      transfers = transfers.map((el) => {
        return { ...el, type: 'transfer' };
      });

      const result: any[] = [...transactions, ...purchases, ...transfers];

      if (sort === 'desc') {
        result.sort((a, b) => b.createdAt - a.createdAt);
      } else if (sort === 'asc') {
        result.sort((a, b) => a.createdAt - b.createdAt);
      }

      return {
        result: result.slice((page - 1) * count, page * count),
        pages: result.length > count ? Math.ceil(result.length / count) : 1,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBalance(token: string) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      if (!isUser) {
        throw new HttpException(
          'Пользователь не найден',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userSerivce.findById(isUser.id);

      return { balance: user.mainBalance + user.bonusBalance };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async undoPurchase(token: string, inventoryId: number) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      if (!isUser) {
        throw new HttpException(
          'Пользователь не найден',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userSerivce.findById(isUser.id);

      const removeItem = await this.prisma.inventory.findUnique({
        where: {
          id: inventoryId,
        },
        include: {
          product: true,
        },
      });

      if (removeItem.status == 'ON_SERVER') {
        throw new HttpException(
          'Предмет уже активирован и не может быть возвращен',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.prisma.$transaction(async (tx) => {
        const refundMoney = await tx.purchase.findFirst({
          where: {
            id: removeItem.historyOfPurchaseId,
            userId: user.id,
          },
        });

        const refundPurchase = await tx.purchase.create({
          data: {
            userId: user.id,
            amount: removeItem.amount,
            refund: true,
            productId: removeItem.productId,
            lostBonusBalance: refundMoney.lostBonusBalance,
            lostMainBalance: refundMoney.lostMainBalance,
          },
        });

        await tx.inventory.delete({
          where: {
            id: removeItem.id,
          },
        });

        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            mainBalance: user.mainBalance + refundMoney.lostMainBalance,
            bonusBalance: user.bonusBalance + refundMoney.lostBonusBalance,
          },
        });

        /* const refundMoney = await tx.purchase.aggregate({
          where: {
            productId: removeItem.id,
            refund: false,
            userId: user.id,
          },
          _sum: {
            lostBonusBalance: true,
            lostMainBalance: true,
          },
        });

        const refundPurchase = await tx.purchase.create({
          data: {
            userId: user.id,
            amount: removeItem.amount,
            refund: true,
            productId: removeItem.productId,
            lostBonusBalance: refundMoney._sum.lostMainBalance,
            lostMainBalance: refundMoney._sum.lostBonusBalance,
          },
        });
        await tx.inventory.delete({
          where: {
            id: removeItem.id,
          },
        });
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            mainBalance: user.mainBalance + refundMoney._sum.lostMainBalance,
            bonusBalance: user.bonusBalance + refundMoney._sum.lostBonusBalance,
          },
        }); */
      });
      return {
        status: 'Success',
        data: {},
        message: 'Возврат успешно произведен',
      };
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async updateServer(inventoryItemId: number, serverId: number, token: string) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      if (!isUser) {
        throw new HttpException(
          'Пользователь не найден',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userSerivce.findById(isUser.id);

      const updateItem = await this.prisma.inventory.findFirst({
        where: {
          id: inventoryItemId,
          userId: user.id,
        },
        include: {
          product: true,
        },
      });

      if (updateItem.status == 'ON_SERVER') {
        throw new HttpException(
          'Предмет уже активирован',
          HttpStatus.FORBIDDEN,
        );
      }

      const server = await this.prisma.server.findFirst({
        where: {
          id: serverId,
        },
      });

      if (!server) {
        throw new HttpException('Сервер не найден', HttpStatus.BAD_REQUEST);
      }

      await this.prisma.inventory.update({
        where: {
          id: updateItem.id,
        },
        data: {
          serverId: server.id,
          serverName: server.name,
        },
      });

      return {
        status: 'Success',
        message: `Предмет ${updateItem.product.name} будет активирован на ${server.name}`,
      };
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  }
}
