import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApiRustService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(serverID: number, token: string) {
    try {
      const serverCandidate = await this.prisma.server.findFirst({
        where: {
          serverID,
          apiKey: token,
        },
      });
      if (!serverCandidate) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }
      const productList = await this.prisma.product.findMany({
        where: {
          hidden: false,
          serverTypeId: serverCandidate.serverTypeId,
        },
        select: {
          id: true,
          type: true,
          name: true,
          image: true,
          productContent: true,
          nameID: true,
        },
      });
      const resultData = productList.map((el) => {
        if (el.type != 'GAME_ITEM') {
          return {
            id: el.id,
            type: el.type,
            name: el.name,
            image: el.image,
            data: el.productContent,
          };
        } else {
          return {
            id: el.id,
            type: el.type,
            name: el.name,
            image: el.image,
            data: el.nameID,
          };
        }
      });
      return {
        status: 'Success',
        data: resultData,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async getQueueAuto(serverID: number, token: string) {
    try {
      const serverCandidate = await this.prisma.server.findFirst({
        where: {
          serverID,
          apiKey: token,
        },
      });
      if (!serverCandidate) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }
      await this.prisma.$transaction(async (tx) => {
        const autoActivationItems = await tx.inventory.findMany({
          where: {
            product: {
              autoactivation: true,
            },
          },
          select: {
            id: true,
            amount: true,
            user: {
              select: {
                steamID: true,
              },
            },
            product: {
              select: {
                nameID: true,
              },
            },
          },
        });
        Promise.all([
          autoActivationItems.forEach(async (el) => {
            await tx.inventory.update({
              where: {
                id: el.id,
              },
              data: {
                status: 'ON_SERVER',
              },
            });
          }),
        ]);
        const resultData = autoActivationItems.map((el) => {
          return {
            id: el.id,
            quantity: el.amount,
            steamid: el.user.steamID,
          };
        });
        return {
          status: 'Success',
          data: resultData,
        };
      });
    } catch (error) {
      console.log(error);
      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async queueGet(serverID: number, token: string, steamid: string) {
    try {
      const serverCandidate = await this.prisma.server.findFirst({
        where: {
          serverID,
          apiKey: token,
        },
      });

      if (!serverCandidate) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      const user = await this.prisma.user.findFirst({
        where: {
          steamID: steamid,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      const productList = await this.prisma.inventory.findMany({
        where: {
          status: 'INVENTORY',
        },
        select: {
          id: true,
          amount: true,
          product: {
            select: {
              nameID: true,
            },
          },
        },
      });

      const resultData = productList.map((el) => {
        return {
          id: el.id,
          quantity: el.amount,
        };
      });

      return {
        status: 'Success',
        data: resultData,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async queueGive(
    serverID: number,
    token: string,
    steamid: string,
    queueid: number,
  ) {
    try {
      const serverCandidate = await this.prisma.server.findFirst({
        where: {
          serverID,
          apiKey: token,
        },
      });

      if (!serverCandidate) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      const user = await this.prisma.user.findFirst({
        where: {
          steamID: steamid,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }
      await this.prisma.$transaction(async (tx) => {
        const item = await tx.inventory.findFirst({
          where: {
            id: queueid,
            userId: user.id,
          },
        });

        if (!item) {
          throw new HttpException('Item not found', HttpStatus.BAD_REQUEST);
        }

        await tx.inventory.update({
          where: {
            id: item.id,
          },
          data: {
            status: 'ON_SERVER',
          },
        });
      });
      return;
    } catch (error) {
      console.log(error);
      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async userGet(token: string, steamid: string) {
    try {
      const isValidToken = await this.prisma.baseSettings.findFirst({
        where: {
          apiKey: token,
        },
      });

      if (!isValidToken) {
        throw new HttpException('Api token invalid', HttpStatus.BAD_REQUEST);
      }

      const user = await this.prisma.user.findFirst({
        where: {
          steamID: steamid,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      return {
        status: 'Success',
        data: {
          name: user.steamName,
          avatar: user.steamAvatar,
          balance: user.mainBalance,
          bonus: user.bonusBalance,
          level: user.lvl,
          xp: user.experience,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async productGive(
    token: string,
    steamid: string,
    productId: string,
    quanity: number,
  ) {
    try {
      const isValidToken = await this.prisma.baseSettings.findFirst({
        where: {
          apiKey: token,
        },
      });

      if (!isValidToken) {
        throw new HttpException('Api token invalid', HttpStatus.BAD_REQUEST);
      }

      const user = await this.prisma.user.findFirst({
        where: {
          steamID: steamid,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      const itemCandidate = await this.prisma.product.findFirst({
        where: {
          nameID: productId,
        },
      });

      if (!itemCandidate) {
        throw new HttpException('Item not found', HttpStatus.BAD_REQUEST);
      }

      await this.prisma.$transaction(async (tx) => {
        const newPurchase = await tx.purchase.create({
          data: {
            amount: quanity,
            lostBonusBalance: 0,
            lostMainBalance: 0,
            refund: false,
            productId: itemCandidate.id,
            userId: user.id,
          },
        });

        const newItem = await tx.inventory.create({
          data: {
            amount: quanity,
            productId: itemCandidate.id,
            userId: user.id,
            historyOfPurchaseId: newPurchase.id,
          },
        });
      });

      return;
    } catch (error) {
      console.log(error);
      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async promoCreate(
    token: string,
    promoName: string,
    group: string,
    dateFrom: string,
    dateTo: string,
    pd: boolean,
    sum?: number,
    discount?: number,
    productId?: number,
  ) {
    //TODO: спросить у Оли - делать ли этот метод - NO
  }

  async userAddBonus(
    serverID: number,
    token: string,
    steamId: string,
    sum: number,
  ) {
    try {
      const serverCandidate = await this.prisma.server.findFirst({
        where: {
          serverID,
          apiKey: token,
        },
      });

      if (!serverCandidate) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      const user = await this.prisma.user.findFirst({
        where: {
          steamID: steamId,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
      }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          bonusBalance: user.bonusBalance + sum,
        },
      });
    } catch (error) {
      console.log(error);
      return {
        status: 'Error',
        message: error.message,
      };
    }
  }
}
