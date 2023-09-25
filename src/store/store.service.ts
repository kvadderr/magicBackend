import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Server, Product, User } from '@prisma/client';
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
      } else if (lang == 'en') {
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
          isPack,
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
              } else if (lang == 'en') {
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
              } else if (lang == 'en') {
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

  async refill(money: number, token: string, lang: string) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      const user = await this.userService.findById(isUser.id);

      if (money < 1) {
        throw new HttpException(
          'Сумма для пополнения не может быть меньше 1',
          HttpStatus.BAD_REQUEST,
        );
      }
      //TODO: Переделать реализацию добавления новой транзакции для юзера, т.к есть время между самой операцией и начислением суммы. Менять статус + роут для обратного запроса для платежки
      await this.prisma.$transaction(async (tx) => {
        const newMoney = await tx.transaction.create({
          data: {
            amount: money,
            method: 'card',
            userId: user.id,
            status: 'SUCCESS',
          },
        });

        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            mainBalance: user.mainBalance + money,
          },
        });
      });
      if (lang == 'ru') {
        return {
          status: 'Success',
          data: {},
          message: 'Баланс пополнен',
        };
      } else {
        return {
          status: 'Success',
          data: {},
          message: 'The balance is replenished',
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

  async buyCurrency(
    amount: number,
    currency: Product,
    user: User,
    lang: string,
    serverTypeID: number,
    isPack: boolean,
  ) {
    try {
      const currectPrice = await this.getPriceForCurrency(
        currency.id,
        isPack,
        amount,
      );

      await this.prisma.$transaction(async (tx) => {
        if (user.mainBalance + user.bonusBalance < currectPrice.finalPrice) {
          if (lang == 'ru') {
            throw new HttpException(
              'Недостаточно средств для покупки',
              HttpStatus.FORBIDDEN,
            );
          } else if (lang == 'en') {
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
      return {
        status: 'Success',
        data: {},
        message: 'Покупка успешно произведена',
      };
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
        return { ...data, panelURLs: languageData.ru };
      case 'en':
        return { ...data, panelURLs: languageData.en };
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

  async getPriceForCurrency(
    productId: number,
    isPack?: boolean,
    amount?: number,
    rubs?: number,
  ) {
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
                    amount * product.price * ((100 - finalPrice.procent) / 100),
                  ),
                  type: 'money',
                };
              }
              return {
                finalPrice: Math.round(
                  amount * product.price * ((100 - product.saleDiscount) / 100),
                ),
                type: 'money',
              };
            } else {
              return {
                finalPrice: Math.round(
                  amount * product.price * ((100 - product.saleDiscount) / 100),
                ),
                type: 'money',
              };
            }
          } else if (rubs) {
            return {
              amount: Math.round(
                rubs / (product.price * ((100 - product.saleDiscount) / 100)),
              ),
              type: 'currency',
            };
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

            // const finalPrice = packs.data.find((item) => {
            //   if (item.count == amount) {
            //     return item;
            //   }
            // });

            if (finalPrice) {
              if (finalPrice.procent > product.discount) {
                return {
                  finalPrice: Math.round(
                    amount * product.price * ((100 - finalPrice.procent) / 100),
                  ),
                  type: 'money',
                };
              }

              return {
                finalPrice:
                  product.discount != 1
                    ? Math.round(
                        product.price *
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
                        product.price *
                          ((100 - product.discount) / 100) *
                          amount,
                      )
                    : product.price * amount,
                type: 'money',
              };
            }
          } else if (rubs) {
            return {
              amount: Math.round(
                rubs /
                  (product.price *
                    (product.discount != 1
                      ? (100 - product.discount) / 100
                      : product.discount)),
              ),
              type: 'currency',
            };
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
