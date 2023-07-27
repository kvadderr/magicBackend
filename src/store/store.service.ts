import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async getStoreByServerType(serverTypeId: number) {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          serverTypeId,
          hidden: false,
        },
      });
      const siteSettings = await this.prisma.baseSettings.findFirst();
      if (siteSettings.saleMode) {
        const result = products.map((el) => {
          return {
            ...el,
            price: el.price * el.saleDiscount,
            basePrice: el.price,
            discount: (1 - el.saleDiscount) * 100,
          };
        });
        return result;
      } else {
        const result = products.map((el) => {
          return {
            ...el,
            price: el.price * el.discount,
            basePrice: el.price,
            discount: (1 - el.discount) * 100,
          };
        });
        return result;
      }
    } catch (error) {
      throw error;
    }
  }

  async buyItem(token: string, productId: number, amount: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          id: productId,
        },
      });
      if (product.hidden) {
        throw new HttpException(
          'Этот товар недоступен для покупки',
          HttpStatus.FORBIDDEN,
        );
      }
      const serverType = await this.prisma.serverType.findUnique({
        where: {
          id: product.serverTypeId,
        },
      });
      if (serverType.hidden) {
        throw new HttpException(
          'Покупка недоступна для данного типа сервера',
          HttpStatus.FORBIDDEN,
        );
      }
      const isUser = await this.tokenService.validateAccessToken(token);

      const user = await this.userService.findById(isUser.id);
      //TODO: Реализовать механизм проверки промокодов на скидку на определенный предмет #OUTSTAFF OR BASE REALIZATION
      const saleSetting = await this.prisma.baseSettings.findFirst();
      const result = await this.prisma.$transaction(async (tx) => {
        if (saleSetting.saleMode) {
          if (
            user.mainBalance + user.bonusBalance <
            product.price * product.saleDiscount * amount
          ) {
            throw new HttpException(
              'Недостаточно средств для покупки',
              HttpStatus.FORBIDDEN,
            );
          } else {
            let productPrice = Math.round(
              product.price * product.saleDiscount * amount,
            );
            //productPrice -= user.bonusBalance;
            if (productPrice - user.bonusBalance < 0) {
              await tx.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  bonusBalance: user.bonusBalance - productPrice,
                },
              });

              const purchase = await tx.purchase.create({
                data: {
                  amount,
                  productId: product.id,
                  userId: user.id,
                  lostBonusBalance: productPrice,
                  lostMainBalance: 0,
                  refund: false,
                },
              });
              await tx.inventory.create({
                data: {
                  amount,
                  productId: product.id,
                  serverTypeId: serverType.id,
                  historyOfPurchaseId: purchase.id,
                  userId: user.id,
                },
              });
            } else {
              await tx.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  bonusBalance: 0,
                  mainBalance:
                    user.mainBalance + (user.bonusBalance - productPrice),
                },
              });

              const purchase = await tx.purchase.create({
                data: {
                  amount,
                  productId: product.id,
                  userId: user.id,
                  lostBonusBalance: user.bonusBalance,
                  lostMainBalance: -(user.bonusBalance - productPrice),
                  refund: false,
                },
              });
              await tx.inventory.create({
                data: {
                  amount,
                  productId: product.id,
                  serverTypeId: serverType.id,
                  historyOfPurchaseId: purchase.id,
                  userId: user.id,
                },
              });
            }
          }
        } else {
          if (
            user.mainBalance + user.bonusBalance <
            product.price * product.discount * amount
          ) {
            return new HttpException(
              'Недостаточно средств для покупки',
              HttpStatus.FORBIDDEN,
            );
          } else {
            let productPrice = Math.round(
              product.price * product.discount * amount,
            );
            productPrice -= user.bonusBalance;
            await tx.user.update({
              where: {
                id: user.id,
              },
              data: {
                bonusBalance: 0,
                mainBalance: user.mainBalance - productPrice,
              },
            });
            const purchase = await tx.purchase.create({
              data: {
                amount,
                productId: product.id,
                userId: user.id,
                lostBonusBalance: user.bonusBalance,
                lostMainBalance: productPrice - user.bonusBalance,
                refund: false,
              },
            });
            const itemInInventory = await tx.inventory.findFirst({
              where: {
                userId: user.id,
                productId: productId,
              },
            });
            if (!itemInInventory) {
              await tx.inventory.create({
                data: {
                  amount,
                  productId: product.id,
                  serverTypeId: serverType.id,
                  historyOfPurchaseId: purchase.id,
                  userId: user.id,
                },
              });
            } else {
              await tx.inventory.update({
                where: {
                  id: itemInInventory.id,
                },
                data: {
                  amount: itemInInventory.amount + amount,
                },
              });
            }
          }
        }
      });
      return {
        status: 'Success',
        data: 'Покупка успешно произведена',
      };
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async refill(money: number, token: string) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      const user = await this.userService.findById(isUser.id);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          mainBalance: user.mainBalance + money,
        },
      });

      return {
        status: 'Success',
        data: 'Баланс пополнен',
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
