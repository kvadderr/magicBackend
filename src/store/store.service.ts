import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Server, Product, User } from '@prisma/client';
import { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { catchError, firstValueFrom, last } from 'rxjs';
import { MONEY_SECRET_KEY, PROJECT_KEY } from 'src/core/config';
import {
  fail_url,
  gmApiTerminal,
  gmTerminal,
  success_url,
} from 'src/core/constant';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    private readonly httpService: HttpService,
    private readonly paymentService: PaymentService,
  ) {}

  async getStoreByServerType(serverTypeId: number, lang: string) {
    try {
      let products = await this.prisma.product.findMany({
        where: {
          serverTypeId,
          hidden: false,
        },
      });
      if (lang == 'ru') {
        let ruProductConent;
        products = products.map((el) => {
          if (JSON.parse(JSON.stringify(el.productContent))) {
            ruProductConent = JSON.parse(JSON.stringify(el.productContent));
            if (ruProductConent.ru) {
              return {
                ...el,
                description: el.description_ru,
                name: el.name_ru,
                textButton: el.textButton,
                productContent: ruProductConent.ru,
              };
            }
            return {
              ...el,
              description: el.description_ru,
              name: el.name_ru,
              textButton: el.textButton,
            };
          }

          return {
            ...el,
            description: el.description_ru,
            name: el.name_ru,
            textButton: el.textButton,
          };
        });
      } else if (lang == 'en') {
        let enProductConent;
        products = products.map((el) => {
          if (JSON.parse(JSON.stringify(el.productContent))) {
            enProductConent = JSON.parse(JSON.stringify(el.productContent));
            if (enProductConent.en) {
              return {
                ...el,
                description: el.description_en,
                name: el.name_en,
                textButton: el.textButton_en,
                productContent: enProductConent.en,
              };
            }
            return {
              ...el,
              description: el.description_en,
              name: el.name_en,
              textButton: el.textButton_en,
            };
          }
          return {
            ...el,
            description: el.description_en,
            name: el.name_en,
            textButton: el.textButton_en,
          };
        });
      }
      const siteSettings = await this.prisma.baseSettings.findFirst();
      if (siteSettings.saleMode) {
        const result = products.map((el) => {
          if (el.saleDiscount != 1) {
            return {
              ...el,
              price: Math.round(el.price * ((100 - el.saleDiscount) / 100)),
              basePrice: el.price,
              discount: el.saleDiscount,
            };
          } else {
            return {
              ...el,
              price: Math.round(el.price * el.saleDiscount),
              basePrice: el.price,
              discount: null,
            };
          }
        });
        result.sort((a, b) => {
          return a.number - b.number;
        });
        return result;
      } else {
        const result = products.map((el) => {
          if (el.discount != 1) {
            return {
              ...el,
              price: Math.round(el.price * ((100 - el.discount) / 100)),
              basePrice: el.price,
              discount: el.discount,
            };
          } else {
            return {
              ...el,
              price: Math.round(el.price * el.discount),
              basePrice: el.price,
              discount: null,
            };
          }
        });
        result.sort((a, b) => {
          return a.number - b.number;
        });
        return result;
      }
    } catch (error) {
      throw error;
    }
  }

  async buyItem(
    token: string,
    productId: number,
    amount: number,
    serverId: number,
    lang: string,
    isPack: boolean,
  ) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      const product = await this.prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      const serverType = await this.prisma.serverType.findUnique({
        where: {
          id: product.serverTypeId,
        },
      });

      if (lang == 'ru') {
        if (amount < 1) {
          throw new HttpException(
            'Количество товара не может быть меньше 1',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (product.hidden) {
          throw new HttpException(
            'Этот товар недоступен для покупки',
            HttpStatus.FORBIDDEN,
          );
        }

        if (serverType.hidden) {
          throw new HttpException(
            'Покупка недоступна для данного типа сервера',
            HttpStatus.FORBIDDEN,
          );
        }
      } else {
        if (amount < 1) {
          throw new HttpException(
            'The quantity of the product cannot be less than 1',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (product.hidden) {
          throw new HttpException(
            'This item is not available for purchase',
            HttpStatus.FORBIDDEN,
          );
        }

        if (serverType.hidden) {
          throw new HttpException(
            'This item is not available for purchase',
            HttpStatus.FORBIDDEN,
          );
        }
      }

      const user = await this.userService.findById(isUser.id);

      if (product.type == 'CURRENCY') {
        return this.buyCurrency(
          amount,
          product,
          user,
          lang,
          product.serverTypeId,
        );
      }

      let server: Server;
      let finalPrice = 0;

      if (serverId !== 0) {
        server = await this.prisma.server.findFirstOrThrow({
          where: {
            id: serverId,
          },
        });
      }

      const saleSetting = await this.prisma.baseSettings.findFirst();
      await this.prisma.$transaction(async (tx) => {
        const count = amount / product.amount;
        switch (saleSetting.saleMode) {
          case true:
            if (
              user.mainBalance + user.bonusBalance <
              Math.round(
                product.price * ((100 - product.saleDiscount) / 100) * count,
              )
            ) {
              if (lang == 'ru') {
                throw new HttpException(
                  'Недостаточно средств для покупки',
                  HttpStatus.FORBIDDEN,
                );
              } else {
                throw new HttpException(
                  'Not enough funds to buy',
                  HttpStatus.FORBIDDEN,
                );
              }
            } else {
              let productPrice = Math.round(
                product.price * ((100 - product.saleDiscount) / 100) * count,
              );

              //productPrice -= user.bonusBalance;
              if (productPrice - user.bonusBalance < 0) {
                await tx.user.update({
                  where: {
                    id: user.id,
                  },
                  data: {
                    bonusBalance: user.bonusBalance - productPrice,
                    lastActivity: new Date(),
                  },
                });

                const currentDate = new Date();

                // Преобразование к формату DD.MM.YY
                const day = String(currentDate.getDate()).padStart(2, '0');
                const month = String(currentDate.getMonth() + 1).padStart(
                  2,
                  '0',
                );
                const year = String(currentDate.getFullYear()).slice(-2);

                const formattedDate = `${day}.${month}.${year}`;

                const purchase = await tx.purchase.create({
                  data: {
                    amount,
                    productId: product.id,
                    userId: user.id,
                    lostBonusBalance: productPrice,
                    lostMainBalance: 0,
                    refund: false,
                    dateOfPurchase: formattedDate,
                  },
                });

                let inventoryObject: InventoryData = {
                  amount: amount,
                  productId: product.id,
                  serverTypeId: serverType.id,
                  historyOfPurchaseId: purchase.id,
                  userId: user.id,
                  serverId: null,
                  serverName: null,
                };
                if (serverId !== 0) {
                  inventoryObject.serverId = serverId;
                  inventoryObject.serverName = server.name;
                }

                if (product.type == 'SETS_OF_PRODUCTS') {
                  const packs: ItemPacks = JSON.parse(
                    JSON.stringify(product.productContent),
                  );
                  packs.data.forEach(async (el) => {
                    await tx.inventory.create({
                      data: {
                        amount: el.amount,
                        productId: el.itemId,
                        serverId: inventoryObject.serverId,
                        serverName: inventoryObject.serverName,
                        serverTypeId: inventoryObject.serverTypeId,
                        userId: inventoryObject.userId,
                        historyOfPurchaseId:
                          inventoryObject.historyOfPurchaseId,
                        isPartOfPack: true,
                        packId: product.id,
                      },
                    });
                  });
                } else {
                  await tx.inventory.create({
                    data: {
                      ...inventoryObject,
                    },
                  });
                }
              } else {
                await tx.user.update({
                  where: {
                    id: user.id,
                  },
                  data: {
                    bonusBalance: 0,
                    mainBalance:
                      user.mainBalance + (user.bonusBalance - productPrice),
                    lastActivity: new Date(),
                  },
                });

                const currentDate = new Date();

                // Преобразование к формату DD.MM.YY
                const day = String(currentDate.getDate()).padStart(2, '0');
                const month = String(currentDate.getMonth() + 1).padStart(
                  2,
                  '0',
                );
                const year = String(currentDate.getFullYear()).slice(-2);

                const formattedDate = `${day}.${month}.${year}`;

                const purchase = await tx.purchase.create({
                  data: {
                    amount,
                    productId: product.id,
                    userId: user.id,
                    lostBonusBalance: user.bonusBalance,
                    lostMainBalance: -(user.bonusBalance - productPrice),
                    refund: false,
                    dateOfPurchase: formattedDate,
                  },
                });
                let inventoryObject: InventoryData = {
                  amount: amount,
                  productId: product.id,
                  serverTypeId: serverType.id,
                  historyOfPurchaseId: purchase.id,
                  userId: user.id,
                  serverId: null,
                  serverName: null,
                };
                if (serverId !== 0) {
                  inventoryObject.serverId = serverId;
                  inventoryObject.serverName = server.name;
                }

                if (product.type == 'SETS_OF_PRODUCTS') {
                  const packs: ItemPacks = JSON.parse(
                    JSON.stringify(product.productContent),
                  );
                  for (let i = 0; i < packs.data.length; i++) {
                    await tx.inventory.create({
                      data: {
                        amount: packs.data[i].amount,
                        productId: packs.data[i].itemId,
                        serverId: inventoryObject.serverId,
                        serverName: inventoryObject.serverName,
                        serverTypeId: inventoryObject.serverTypeId,
                        userId: inventoryObject.userId,
                        historyOfPurchaseId:
                          inventoryObject.historyOfPurchaseId,
                        isPartOfPack: true,
                        packId: product.id,
                      },
                    });
                  }
                } else {
                  await tx.inventory.create({
                    data: {
                      ...inventoryObject,
                    },
                  });
                }
              }
            }
            break;
          case false:
            product.discount != 1
              ? (finalPrice = Math.round(
                  product.price * ((100 - product.discount) / 100) * count,
                ))
              : (finalPrice = product.price * count);
            if (user.mainBalance + user.bonusBalance < finalPrice) {
              if (lang == 'ru') {
                throw new HttpException(
                  'Недостаточно средств для покупки',
                  HttpStatus.FORBIDDEN,
                );
              } else {
                throw new HttpException(
                  'Not enough funds to buy',
                  HttpStatus.FORBIDDEN,
                );
              }
            } else {
              let productPrice;
              product.discount != 1
                ? (productPrice = Math.round(
                    product.price * ((100 - product.discount) / 100) * count,
                  ))
                : (productPrice = product.price * count);

              //productPrice -= user.bonusBalance;
              if (productPrice - user.bonusBalance < 0) {
                await tx.user.update({
                  where: {
                    id: user.id,
                  },
                  data: {
                    bonusBalance: user.bonusBalance - productPrice,
                    lastActivity: new Date(),
                  },
                });

                const currentDate = new Date();

                // Преобразование к формату DD.MM.YY
                const day = String(currentDate.getDate()).padStart(2, '0');
                const month = String(currentDate.getMonth() + 1).padStart(
                  2,
                  '0',
                );
                const year = String(currentDate.getFullYear()).slice(-2);

                const formattedDate = `${day}.${month}.${year}`;

                const purchase = await tx.purchase.create({
                  data: {
                    amount,
                    productId: product.id,
                    userId: user.id,
                    lostBonusBalance: productPrice,
                    lostMainBalance: 0,
                    refund: false,
                    dateOfPurchase: formattedDate,
                  },
                });

                let inventoryObject: InventoryData = {
                  amount: amount,
                  productId: product.id,
                  serverTypeId: serverType.id,
                  historyOfPurchaseId: purchase.id,
                  userId: user.id,
                  serverId: null,
                  serverName: null,
                };
                if (serverId !== 0) {
                  inventoryObject.serverId = serverId;
                  inventoryObject.serverName = server.name;
                }

                if (product.type == 'SETS_OF_PRODUCTS') {
                  const packs: ItemPacks = JSON.parse(
                    JSON.stringify(product.productContent),
                  );
                  for (let i = 0; i < packs.data.length; i++) {
                    await tx.inventory.create({
                      data: {
                        amount: packs.data[i].amount,
                        productId: packs.data[i].itemId,
                        serverId: inventoryObject.serverId,
                        serverName: inventoryObject.serverName,
                        serverTypeId: inventoryObject.serverTypeId,
                        userId: inventoryObject.userId,
                        historyOfPurchaseId:
                          inventoryObject.historyOfPurchaseId,
                        isPartOfPack: true,
                        packId: product.id,
                      },
                    });
                  }
                } else {
                  await tx.inventory.create({
                    data: {
                      ...inventoryObject,
                    },
                  });
                }
              } else {
                await tx.user.update({
                  where: {
                    id: user.id,
                  },
                  data: {
                    bonusBalance: 0,
                    mainBalance:
                      user.mainBalance + (user.bonusBalance - productPrice),
                    lastActivity: new Date(),
                  },
                });

                const currentDate = new Date();

                // Преобразование к формату DD.MM.YY
                const day = String(currentDate.getDate()).padStart(2, '0');
                const month = String(currentDate.getMonth() + 1).padStart(
                  2,
                  '0',
                );
                const year = String(currentDate.getFullYear()).slice(-2);

                const formattedDate = `${day}.${month}.${year}`;

                const purchase = await tx.purchase.create({
                  data: {
                    amount,
                    productId: product.id,
                    userId: user.id,
                    lostBonusBalance: user.bonusBalance,
                    lostMainBalance: -(user.bonusBalance - productPrice),
                    refund: false,
                    dateOfPurchase: formattedDate,
                  },
                });
                let inventoryObject: InventoryData = {
                  amount: amount,
                  productId: product.id,
                  serverTypeId: serverType.id,
                  historyOfPurchaseId: purchase.id,
                  userId: user.id,
                  serverId: null,
                  serverName: null,
                };
                if (serverId !== 0) {
                  inventoryObject.serverId = serverId;
                  inventoryObject.serverName = server.name;
                }

                if (product.type == 'SETS_OF_PRODUCTS') {
                  const packs: ItemPacks = JSON.parse(
                    JSON.stringify(product.productContent),
                  );

                  for (let i = 0; i < packs.data.length; i++) {
                    await tx.inventory.create({
                      data: {
                        amount: packs.data[i].amount,
                        productId: packs.data[i].itemId,
                        serverId: inventoryObject.serverId,
                        serverName: inventoryObject.serverName,
                        serverTypeId: inventoryObject.serverTypeId,
                        userId: inventoryObject.userId,
                        historyOfPurchaseId:
                          inventoryObject.historyOfPurchaseId,
                        isPartOfPack: true,
                        packId: product.id,
                      },
                    });
                  }
                } else {
                  await tx.inventory.create({
                    data: {
                      ...inventoryObject,
                    },
                  });
                }
              }
            }
          default:
            break;
        }
      });
      if (lang == 'ru') {
        return {
          status: 'Success',
          data: {},
          message: 'Покупка успешно произведена',
        };
      } else {
        return {
          status: 'Success',
          data: {},
          message: 'The purchase was made successfully',
        };
      }
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async refill(
    money: number,
    token: string,
    lang: string,
    type: string,
    ip: string,
    country: string,
  ) {
    try {
      if (
        (type != 'card' && type != 'qiwi') ||
        (country != 'RUB' && country != 'KZT')
      ) {
        throw new HttpException(
          'Введен некорректный тип оплаты',
          HttpStatus.BAD_REQUEST,
        );
      }
      const isUser = await this.tokenService.validateAccessToken(token);

      if (isUser == null) {
        throw new UnauthorizedException('Ошибка сессии. Обновите страницу');
      }

      const user = await this.userService.findById(isUser.id);
      let moneyData;

      const finalAmount = await this.getPriceForRefill(money, lang, type);

      await this.prisma.$transaction(async (tx) => {
        const newMoney = await tx.transaction.create({
          data: {
            amount: finalAmount,
            method: 'IN PROGRESS',
            status: 'IN_PROGRESS',
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        if (type == 'card') {
          const paymentData = {
            ip,
            amount: money,
            project: PROJECT_KEY,
            user: user.steamID,
            user_currency: country,
            comment: 'Пополнение баланса',
            success_url: success_url,
            fail_url: fail_url,
            project_invoice: `${newMoney.id}`,
            type,
            return_mode: 'skip',
            terminal_livetime: 1200,
          };
          console.log(paymentData);

          const signature = this.calculateHMAC(this.stringifyData(paymentData));

          const finalData = { ...paymentData, signature };

          /*  moneyData = await (
            await firstValueFrom(
              this.httpService
                .post(`${gmApiTerminal}`, finalData, {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                })
                .pipe(
                  catchError((error: AxiosError) => {
                    console.error(error.response.data);
                    throw 'An error happened!';
                  }),
                ),
            )
          ).data; */
        } else {
          const paymentData = {
            ip,
            amount: money,
            project: PROJECT_KEY,
            user: user.steamID,
            user_currency: country,
            comment: 'Пополнение баланса',
            success_url: success_url,
            fail_url: fail_url,
            project_invoice: `${newMoney.id}`,
            return_mode: 'skip',
            terminal_livetime: 1200,
            terminal_allow_methods: [type],
          };
          const signature = this.calculateHMAC(this.stringifyData(paymentData));

          const finalData = { ...paymentData, signature };

          /* moneyData = await (
            await firstValueFrom(
              this.httpService
                .post(`${gmTerminal}`, finalData, {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                })
                .pipe(
                  catchError((error: AxiosError) => {
                    console.error(error.response.data);
                    throw 'An error happened!';
                  }),
                ),
            )
          ).data; */
        }
      });
      console.log(moneyData);

      if (lang == 'ru') {
        return {
          status: 'Success',
          data: {
            state: moneyData.state,
            time: moneyData.time,
            url: `http://localhost:3001/store?payment=success`,
            invoice: moneyData.invoice,
            signature: moneyData.signature,
          },
        };
      } else {
        return {
          status: 'Success',
          data: {
            state: moneyData.state,
            time: moneyData.time,
            url: moneyData.data ? moneyData.data : moneyData.url,
            invoice: moneyData.invoice,
            signature: moneyData.signature,
          },
        };
      }
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
        url: `http://localhost:3001/store?payment=error`,
      };
    }
  }
  //TODO: переписать возврат средств для платежки
  /*  async refundTransaction(id: number) {
    try {
      const paymentData = {
        project: PROJECT_KEY,
        projectId: `test`,
        user: 76561198075427441,
        ip: '46.147.216.119',
        amount: 25,
        wallet: '2202202226924359',
        currency: 'RUB',
        description: 'Рефанд',
        type: 'card',
      };

      const signature = await this.calculateRSA(
        this.stringifyData(paymentData),
      );
      const finalData = { ...paymentData, signature };
      const moneyData = await firstValueFrom(
        this.httpService
          .post(`${gmRefund}`, finalData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(error.response.data);
              throw 'An error happened!';
            }),
          ),
      );

      console.log(moneyData.config);
      console.log(moneyData.data);

      const refundMoney = await this.prisma.transaction.findFirstOrThrow({
        where: {
          id,
        },
      });

      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          id: refundMoney.userId,
        },
      });

      await this.prisma.$transaction(async (tx) => {
        if (user.mainBalance - refundMoney.amount < 0) {
          throw new HttpException(
            'Возврат невозможен, на балансе меньше необходимой суммы',
            HttpStatus.BAD_REQUEST,
          );
        }

        await tx.transaction.create({
          data: {
            amount: refundMoney.amount,
            method: refundMoney.method,
            userId: refundMoney.userId,
            status: 'REFUND',
          },
        });

        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            mainBalance: user.mainBalance - refundMoney.amount,
          },
        });
      });

      return {
        status: 'Success',
        data: { ...moneyData.data },
        message: `Отправлен запрос на возврат средств для ${user.steamName}`,
      };
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  } */

  async buyCurrency(
    amount: number,
    currency: Product,
    user: User,
    lang: string,
    serverTypeID: number,
  ) {
    try {
      const currectPrice = await this.getPriceForCurrency(currency.id, amount);

      await this.prisma.$transaction(async (tx) => {
        if (user.mainBalance + user.bonusBalance < currectPrice.finalPrice) {
          if (lang == 'ru') {
            throw new HttpException(
              'Недостаточно средств для покупки',
              HttpStatus.FORBIDDEN,
            );
          } else {
            throw new HttpException(
              'Not enough funds to buy',
              HttpStatus.FORBIDDEN,
            );
          }
        } else {
          if (currectPrice.finalPrice - user.bonusBalance < 0) {
            await tx.user.update({
              where: {
                id: user.id,
              },
              data: {
                bonusBalance: user.bonusBalance - currectPrice.finalPrice,
                lastActivity: new Date(),
              },
            });

            const currentDate = new Date();

            // Преобразование к формату DD.MM.YY
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const year = String(currentDate.getFullYear()).slice(-2);

            const formattedDate = `${day}.${month}.${year}`;

            const purchase = await tx.purchase.create({
              data: {
                amount,
                productId: currency.id,
                userId: user.id,
                lostBonusBalance: currectPrice.finalPrice,
                lostMainBalance: 0,
                refund: false,
                dateOfPurchase: formattedDate,
              },
            });

            let inventoryObject: InventoryData = {
              amount: amount,
              productId: currency.id,
              serverTypeId: serverTypeID,
              historyOfPurchaseId: purchase.id,
              userId: user.id,
              serverId: null,
              serverName: null,
            };

            await tx.inventory.create({
              data: {
                ...inventoryObject,
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
                  user.mainBalance +
                  (user.bonusBalance - currectPrice.finalPrice),
                lastActivity: new Date(),
              },
            });

            const currentDate = new Date();

            // Преобразование к формату DD.MM.YY
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const year = String(currentDate.getFullYear()).slice(-2);

            const formattedDate = `${day}.${month}.${year}`;

            const purchase = await tx.purchase.create({
              data: {
                amount,
                productId: currency.id,
                userId: user.id,
                lostBonusBalance: user.bonusBalance,
                lostMainBalance: -(user.bonusBalance - currectPrice.finalPrice),
                refund: false,
                dateOfPurchase: formattedDate,
              },
            });
            let inventoryObject: InventoryData = {
              amount: amount,
              productId: currency.id,
              serverTypeId: serverTypeID,
              historyOfPurchaseId: purchase.id,
              userId: user.id,
              serverId: null,
              serverName: null,
            };

            await tx.inventory.create({
              data: {
                ...inventoryObject,
              },
            });
          }
        }
      });
      if (lang == 'ru') {
        return {
          status: 'Success',
          data: {},
          message: 'Покупка успешно произведена',
        };
      } else {
        return {
          status: 'Success',
          data: {},
          message: 'The purchase was made successfully',
        };
      }
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async getTypes() {
    return this.prisma.serverType.findMany();
  }

  async getBaseSettings(lang?: string) {
    const data = await this.prisma.baseSettings.findFirst();
    const languageData = JSON.parse(JSON.stringify(data.panelURLs));

    switch (lang) {
      case 'ru':
        return {
          ...data,
          panelURLs: {
            ...languageData.ru,
            cardProcent: languageData.cardProcent,
            qiwiProcent: languageData.qiwiProcent,
            data: languageData.data,
          },
        };
      case 'en':
        return {
          ...data,
          panelURLs: {
            ...languageData.en,
            cardProcent: languageData.cardProcent,
            qiwiProcent: languageData.qiwiProcent,
            data: languageData.data,
          },
        };
      default:
        return data;
    }
  }

  async getCurrentPrice(productId: number, amount: number) {
    try {
      if (amount < 1) {
        throw new HttpException(
          'Количество предметов не может быть меньше 1',
          HttpStatus.BAD_REQUEST,
        );
      }

      const product = await this.prisma.product.findFirstOrThrow({
        where: {
          id: productId,
        },
      });

      const settings = await this.getBaseSettings();
      let currentPrice = 0;
      if (settings.saleMode) {
        const count = amount / product.amount;
        if (product.type == 'SERVICE') {
          return Math.round(
            product.price * ((100 - product.saleDiscount) / 100),
          );
        }
        currentPrice = Math.round(
          product.price * count * ((100 - product.saleDiscount) / 100),
        );
        return currentPrice;
      }
      const count = amount / product.amount;
      if (product.type == 'SERVICE') {
        product.discount != 1
          ? (currentPrice = Math.round(
              product.price * ((100 - product.discount) / 100),
            ))
          : (currentPrice = product.price);
        return currentPrice;
      }
      product.discount != 1
        ? (currentPrice = Math.round(
            product.price * ((100 - product.discount) / 100) * count,
          ))
        : (currentPrice = product.price * count);

      return currentPrice;
    } catch (error) {
      console.log(error);

      return {
        status: 'Error',
        message: error.message,
      };
    }
  }

  async getPriceForRefill(money: number, lang: string, type: string) {
    if (money < 25) {
      if (lang == 'ru') {
        throw new HttpException(
          'Сумма для пополнения не может быть меньше 25',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'The amount to top up cannot be less than 25',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const progressBar: Packs = JSON.parse(
      JSON.stringify((await this.prisma.baseSettings.findFirst()).panelURLs),
    );

    let bonusForType =
      type === 'card'
        ? Math.round(money * (progressBar.cardProcent / 100))
        : Math.round(money * (progressBar.qiwiProcent / 100));

    let finalAmount: number;
    for (let i = progressBar.data.length - 1; i > -1; i--) {
      if (money >= progressBar.data[i].count) {
        finalAmount =
          money + Math.round(money * (progressBar.data[i].procent / 100));
        break;
      } else {
        finalAmount = money;
      }
    }
    finalAmount += bonusForType;
    return finalAmount;
  }

  async getPriceForCurrency(productId: number, amount?: number, rubs?: number) {
    try {
      if (rubs && amount) {
        throw new HttpException(
          'На вход не может придти оба параметра',
          HttpStatus.BAD_REQUEST,
        );
      }
      const product = await this.prisma.product.findFirstOrThrow({
        where: {
          id: productId,
        },
      });

      if (product.type != 'CURRENCY') {
        throw new HttpException(
          'Указан некорректный предмет',
          HttpStatus.BAD_REQUEST,
        );
      }

      const settings = await this.getBaseSettings();

      switch (settings.saleMode) {
        case true:
          if (amount) {
            const packs: Packs = JSON.parse(
              JSON.stringify(product.productContent),
            );

            let finalPrice: PackData;

            for (let i = packs.data.length - 1; i > -1; i--) {
              if (amount >= packs.data[i].count) {
                finalPrice = packs.data[i];
                break;
              }
            }

            // const finalPrice = packs.data.find((item) => {
            //   if (item.count == amount) {
            //     return item;
            //   }
            // });

            if (finalPrice) {
              if (finalPrice.procent > product.saleDiscount) {
                return {
                  finalPrice: Math.round(
                    amount *
                      (product.price / product.amount) *
                      ((100 - finalPrice.procent) / 100),
                  ),
                  type: 'money',
                };
              }
              return {
                finalPrice: Math.round(
                  amount *
                    (product.price / product.amount) *
                    ((100 - product.saleDiscount) / 100),
                ),
                type: 'money',
              };
            } else {
              return {
                finalPrice: Math.round(
                  amount *
                    (product.price / product.amount) *
                    ((100 - product.saleDiscount) / 100),
                ),
                type: 'money',
              };
            }
          } else if (rubs) {
            const packs: Packs = JSON.parse(
              JSON.stringify(product.productContent),
            );

            let finalPrice: PackData;

            for (let i = packs.data.length - 1; i > -1; i--) {
              if (rubs * product.amount >= packs.data[i].count) {
                finalPrice = packs.data[i];
                break;
              }
            }

            if (finalPrice) {
              if (finalPrice.procent > product.saleDiscount) {
                return {
                  finalPrice:
                    Math.round(
                      rubs * product.price * ((100 - finalPrice.procent) / 100),
                    ) * product.amount,
                  type: 'currency',
                };
              }
              return {
                finalPrice:
                  Math.round(
                    rubs * product.price * ((100 - product.saleDiscount) / 100),
                  ) * product.amount,
                type: 'currency',
              };
            } else {
              return {
                finalPrice:
                  Math.round(
                    rubs * product.price * ((100 - product.saleDiscount) / 100),
                  ) * product.amount,
                type: 'currency',
              };
            }
          }
          break;
        case false:
          if (amount) {
            const packs: Packs = JSON.parse(
              JSON.stringify(product.productContent),
            );

            let finalPrice: PackData;

            for (let i = packs.data.length - 1; i > -1; i--) {
              if (amount >= packs.data[i].count) {
                finalPrice = packs.data[i];
                break;
              }
            }

            if (finalPrice) {
              if (finalPrice.procent > product.discount) {
                return {
                  finalPrice: Math.round(
                    amount *
                      (product.price / product.amount) *
                      ((100 - finalPrice.procent) / 100),
                  ),
                  type: 'money',
                };
              }

              return {
                finalPrice:
                  product.discount != 1
                    ? Math.round(
                        (product.price / product.amount) *
                          ((100 - product.discount) / 100) *
                          amount,
                      )
                    : product.price * amount,
                type: 'money',
              };
            } else {
              return {
                finalPrice:
                  product.discount != 1
                    ? Math.round(
                        (product.price / product.amount) *
                          ((100 - product.discount) / 100) *
                          amount,
                      )
                    : (product.price / product.amount) * amount,
                type: 'money',
              };
            }
          } else if (rubs) {
            const packs: Packs = JSON.parse(
              JSON.stringify(product.productContent),
            );

            let finalPrice: PackData;

            for (let i = packs.data.length - 1; i > -1; i--) {
              if (rubs * product.amount >= packs.data[i].count) {
                finalPrice = packs.data[i];
                break;
              }
            }

            if (finalPrice) {
              if (finalPrice.procent > product.discount) {
                return {
                  amount:
                    Math.round(
                      rubs /
                        (product.price * ((100 - finalPrice.procent) / 100)),
                    ) * product.amount,

                  type: 'currency',
                };
              }

              return {
                amount:
                  product.discount != 1
                    ? Math.round(
                        rubs /
                          (product.price * ((100 - product.discount) / 100)),
                      ) * product.amount
                    : product.price * rubs,
                type: 'currency',
              };
            } else {
              return {
                amount:
                  product.discount != 1
                    ? Math.round(
                        rubs /
                          (product.price * ((100 - product.discount) / 100)),
                      ) * product.amount
                    : product.price * rubs,
                type: 'currency',
              };
            }
            /*  return {
              amount: Math.round(
                rubs /
                  (product.price *
                    (product.discount != 1
                      ? (100 - product.discount) / 100
                      : product.discount)),
              ),
              type: 'currency',
            }; */
          }
        default:
          break;
      }
    } catch (error) {
      console.log(error);

      throw {
        status: 'Error',
        message: error.message,
      };
    }
  }

  stringifyData(data: any, prefix = ''): string {
    let result = '';

    const sortedKeys = Object.keys(data).sort();

    for (const key of sortedKeys) {
      const value = data[key];

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (i == 0) {
            result += `${key}:${i}:${value[i]};`;
          } else {
            result += `${i}:${value[i]};`;
          }
        }
        result += ';';
      } else {
        result += `${key}:${value};`;
      }
    }

    return result;
  }

  private calculateHMAC(data: string) {
    return crypto
      .createHmac('sha256', MONEY_SECRET_KEY)
      .update(data)
      .digest('hex');
  }

  async checkNotificationTransaction(token: string, lang: string) {
    const isUser = await this.tokenService.validateAccessToken(token);
    if (isUser == null) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }
    const user = await this.userService.findById(isUser.id);
    const lastTransaction = await this.prisma.transaction.findFirst({
      where: {
        userId: user.id,
        status: 'IN_PROGRESS',
        sendNotification: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!lastTransaction) {
      return;
    }

    return this.paymentService.getInfo(lastTransaction, lang);
  }
}

type InventoryData = {
  amount: number;
  productId: number;
  serverTypeId: number;
  historyOfPurchaseId: number;
  userId: number;
  serverId: number | null;
  serverName: string | null;
};

type Packs = {
  data: PackData[];
  cardProcent: number;
  qiwiProcent: number;
};
type PackData = {
  count: number;
  procent: number;
};

type ItemPacks = {
  data: ItemPacksData[];
};

type ItemPacksData = {
  icon: string;
  amount: number;
  itemId: number;
};

type baseObject = {
  id: number;
  url: string;
  icon: string;
  name: string;
};

type BaseSettings = {
  ru: {
    contacts: baseObject[];
    sections: baseObject[];
    isShowContacts: boolean;
    footer: {
      contacts: baseObject[];
      urlRules: string;
    };
  };
  en: {
    contacts: baseObject[];
    sections: baseObject[];
    isShowContacts: boolean;
    footer: {
      contacts: baseObject[];
      urlRules: string;
    };
  };
};

type PaymentDataResponse = {
  url: string;
  state: string;
  time: string;
  signature: string;
};
