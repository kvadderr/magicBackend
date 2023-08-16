import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApiRustService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(serverID: number, token: string) {
    try {
      const serverCandidate = await this.prisma.server.findFirstOrThrow({
        where: {
          serverID,
          apiKey: token,
        },
      });

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
      const serverCandidate = await this.prisma.server.findFirstOrThrow({
        where: {
          serverID,
          apiKey: token,
        },
      });

      const autoActivationItems = await this.prisma.inventory.findMany({
        where: {
          serverId: serverCandidate.id,
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
      await this.prisma.$transaction(async (tx) => {
        await Promise.all(
          autoActivationItems.map(async (el) => {
            await tx.inventory.update({
              where: {
                id: el.id,
              },
              data: {
                status: 'ON_SERVER',
              },
            });
          }),
        );
      });
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
      const serverCandidate = await this.prisma.server.findFirstOrThrow({
        where: {
          serverID,
          apiKey: token,
        },
      });

      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          steamID: steamid,
        },
      });

      const productList = await this.prisma.inventory.findMany({
        where: {
          status: 'INVENTORY',
          serverTypeId: serverCandidate.serverTypeId,
          userId: user.id,
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
      const serverCandidate = await this.prisma.server.findFirstOrThrow({
        where: {
          serverID,
          apiKey: token,
        },
      });

      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          steamID: steamid,
        },
      });

      await this.prisma.$transaction(async (tx) => {
        const item = await tx.inventory.findFirstOrThrow({
          where: {
            id: queueid,
            userId: user.id,
            status: 'INVENTORY',
          },
        });

        if (item.isPartOfPack) {
          const partsOfPacks = await tx.inventory.findMany({
            where: {
              packId: item.packId,
              historyOfPurchaseId: item.historyOfPurchaseId,
            },
          });
          for (let i = 0; i < partsOfPacks.length; i++) {
            await tx.inventory.update({
              where: {
                id: partsOfPacks[i].id,
              },
              data: {
                isCanBeRefund: false,
              },
            });
          }
        }

        await tx.inventory.update({
          where: {
            id: item.id,
          },
          data: {
            status: 'ON_SERVER',
            isCanBeRefund: false,
            serverId: serverCandidate.id,
            serverName: serverCandidate.name,
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
      const isValidToken = await this.prisma.baseSettings.findFirstOrThrow({
        where: {
          apiKey: token,
        },
      });

      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          steamID: steamid,
        },
      });

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
      const isValidToken = await this.prisma.baseSettings.findFirstOrThrow({
        where: {
          apiKey: token,
        },
      });

      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          steamID: steamid,
        },
      });

      const itemCandidate = await this.prisma.product.findFirstOrThrow({
        where: {
          nameID: productId,
        },
      });

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

  async userAddBonus(
    serverID: number,
    token: string,
    steamId: string,
    sum: number,
  ) {
    try {
      const serverCandidate = await this.prisma.server.findFirstOrThrow({
        where: {
          serverID,
          apiKey: token,
        },
      });

      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          steamID: steamId,
        },
      });

      const newData = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          bonusBalance: user.bonusBalance + sum,
        },
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
}
