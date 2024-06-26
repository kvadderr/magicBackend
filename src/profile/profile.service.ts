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

  async getInventory(
    token: string,
    page: number,
    count: number,
    lang?: string,
  ) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      if (!isUser) {
        throw new HttpException(
          'Пользователь не найден или срок действия токена истек',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userSerivce.findById(isUser.id);

      let result = await this.prisma.inventory.findMany({
        where: {
          userId: user.id,
          status: 'INVENTORY',
        },
        include: {
          product: true,
          serverType: true,
        },
      });
      if (lang == 'ru') {
        result = result.map((el) => {
          return {
            ...el,
            description: el.product.description_ru,
            name: el.product.name_ru,
          };
        });
      } else if (lang == 'en') {
        result = result.map((el) => {
          return {
            ...el,
            description: el.product.description_en,
            name: el.product.name_en,
          };
        });
      }
      result.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
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
    lang: string,
  ) {
    try {
      if (!sort) {
        throw new HttpException('Enter type of sort', HttpStatus.BAD_REQUEST);
      }
      const isUser = await this.verifyUser(token);

      const user = await this.userSerivce.findById(isUser.id);

      let transactions = await this.prisma.transaction.findMany({
        where: {
          userId: user.id,
          status: {
            notIn: ['DENIED', 'IN_PROGRESS', 'FALSE'],
          },
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

      if (lang == 'ru') {
        purchases = purchases.map((el) => {
          return {
            ...el,
            description: el.product.description_ru,
            name: el.product.name_ru,
          };
        });
      } else if (lang == 'en') {
        purchases = purchases.map((el) => {
          return {
            ...el,
            description: el.product.description_en,
            name: el.product.name_en,
          };
        });
      }

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

      switch (sort) {
        case 'desc':
          result.sort((a, b) => b.createdAt - a.createdAt);
          break;
        case 'asc':
          result.sort((a, b) => a.createdAt - b.createdAt);
          break;
        default:
          break;
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
      const isUser = await this.verifyUser(token);

      const user = await this.userSerivce.findById(isUser.id);

      return { balance: user.mainBalance + user.bonusBalance };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async undoPurchase(token: string, inventoryId: number) {
    try {
      const isUser = await this.verifyUser(token);

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

      if (removeItem.isPartOfPack) {
        const partsOfPack = await this.prisma.inventory.findMany({
          where: {
            isPartOfPack: true,
            packId: removeItem.packId,
          },
        });
        const isSomeOneActivated = partsOfPack.find((item) => {
          if (!item.isCanBeRefund) {
            return item;
          }
        });

        if (isSomeOneActivated) {
          throw new HttpException(
            'Один из предметов в наборе уже активирован. Возврат невозможен',
            HttpStatus.BAD_REQUEST,
          );
        }

        await this.prisma.$transaction(async (tx) => {
          const refundMoney = await tx.purchase.findFirstOrThrow({
            where: {
              id: removeItem.historyOfPurchaseId,
              userId: user.id,
            },
          });

          const currentDate = new Date();

          // Преобразование к формату DD.MM.YY
          const day = String(currentDate.getDate()).padStart(2, '0');
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const year = String(currentDate.getFullYear()).slice(-2);

          const formattedDate = `${day}.${month}.${year}`;

          const refundPurchase = await tx.purchase.create({
            data: {
              userId: user.id,
              amount: removeItem.amount,
              refund: true,
              productId: removeItem.productId,
              lostBonusBalance: refundMoney.lostBonusBalance,
              lostMainBalance: refundMoney.lostMainBalance,
              dateOfPurchase: formattedDate,
            },
          });

          await tx.inventory.deleteMany({
            where: {
              userId: user.id,
              historyOfPurchaseId: removeItem.historyOfPurchaseId,
            },
          });

          await tx.user.update({
            where: {
              id: user.id,
            },
            data: {
              mainBalance: user.mainBalance + refundMoney.lostMainBalance,
              bonusBalance: user.bonusBalance + refundMoney.lostBonusBalance,
              lastActivity: new Date(),
            },
          });
        });
        return {
          status: 'Success',
          data: {},
          message: 'Возврат успешно произведен',
        };
      }

      await this.prisma.$transaction(async (tx) => {
        const refundMoney = await tx.purchase.findFirst({
          where: {
            id: removeItem.historyOfPurchaseId,
            userId: user.id,
          },
        });

        const currentDate = new Date();

        // Преобразование к формату DD.MM.YY
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = String(currentDate.getFullYear()).slice(-2);

        const formattedDate = `${day}.${month}.${year}`;

        const refundPurchase = await tx.purchase.create({
          data: {
            userId: user.id,
            amount: removeItem.amount,
            refund: true,
            productId: removeItem.productId,
            lostBonusBalance: refundMoney.lostBonusBalance,
            lostMainBalance: refundMoney.lostMainBalance,
            dateOfPurchase: formattedDate,
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
            lastActivity: new Date(),
          },
        });
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
      const isUser = await this.verifyUser(token);

      const user = await this.userSerivce.findById(isUser.id);

      const updateItem = await this.prisma.inventory.findFirstOrThrow({
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

      const server = await this.prisma.server.findFirstOrThrow({
        where: {
          id: serverId,
        },
      });

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
        message: `Предмет ${updateItem.product.name_ru} будет активирован на ${server.name}`,
      };
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  private async verifyUser(token: string) {
    const isUser = await this.tokenService.validateAccessToken(token);

    if (!isUser) {
      throw new HttpException('Пользователь не найден', HttpStatus.BAD_REQUEST);
    }
    return isUser;
  }
}
