import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { gmStatus } from 'src/core/constant';
import { MONEY_SECRET_KEY, PROJECT_KEY } from 'src/core/config';
import { Transaction } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    const currentDateTime: Date = new Date();
    const dateTime30MinutesAgo: Date = new Date(
      currentDateTime.getTime() - 30 * 60 * 1000,
    );

    const newPayments = await this.prisma.transaction.findMany({
      where: {
        status: 'IN_PROGRESS',
        createdAt: {
          lte: currentDateTime,
          gte: dateTime30MinutesAgo,
        },
      },
      include: {
        user: {
          select: {
            steamID: true,
          },
        },
      },
    });
    if (newPayments.length != 0) {
      let transactionData;
      await Promise.all(
        newPayments.map(async (el) => {
          const inputData = {
            project: PROJECT_KEY,
            project_invoice: el.id,
          };
          const signature = this.calculateHMAC(this.stringifyData(inputData));

          transactionData = await firstValueFrom(
            this.httpService
              .post(
                `${gmStatus}`,
                { ...inputData, signature },
                {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                },
              )
              .pipe(
                catchError((error: AxiosError) => {
                  console.error(error.response.data);
                  throw 'An error happened!';
                }),
              ),
          );

          if (
            transactionData.data.state == 'success' &&
            transactionData.data.status == 'Paid'
          ) {
            await this.prisma.$transaction(async (tx) => {
              const user = await tx.user.findFirstOrThrow({
                where: {
                  id: el.userId,
                },
              });

              await tx.transaction.update({
                where: {
                  id: el.id,
                },
                data: {
                  status: 'SUCCESS',
                  method: transactionData.data.type,
                },
              });

              await tx.user.update({
                where: {
                  id: el.userId,
                },
                data: {
                  mainBalance: user.mainBalance + el.amount,
                },
              });
            });
          }
        }),
      );
    }
  }

  async getInfo(order: Transaction, lang) {
    const inputData = {
      project: PROJECT_KEY,
      project_invoice: order.id,
    };
    const signature = this.calculateHMAC(this.stringifyData(inputData));

    const transactionData = await firstValueFrom(
      this.httpService
        .post(
          `${gmStatus}`,
          { ...inputData, signature },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    if (
      transactionData.data.state == 'success' &&
      transactionData.data.status == 'Paid'
    ) {
      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findFirstOrThrow({
          where: {
            id: order.userId,
          },
        });

        await tx.transaction.update({
          where: {
            id: order.id,
          },
          data: {
            sendNotification: true,
            status: 'SUCCESS',
            method: transactionData.data.type,
          },
        });

        await tx.user.update({
          where: {
            id: order.userId,
          },
          data: {
            mainBalance: user.mainBalance + order.amount,
          },
        });
      });
    } else {
      if (lang == 'ru') {
        return {
          status: 'Success',
          data: {},
          message: 'Платеж не найден',
        };
      } else {
        return {
          status: 'Success',
          data: {},
          message: 'Payment not found',
        };
      }
    }
    return;
  }

  /*   @Cron(CronExpression.EVERY_30_MINUTES)
  async garbageCollector() {
    const newPayments = await this.prisma.transaction.findMany({
      where: {
        status: 'IN_PROGRESS',
      },
      include: {
        user: {
          select: {
            steamID: true,
          },
        },
      },
    });
    if (newPayments.length != 0) {
      const currentTime = new Date();
      const garbage = newPayments.map((el) => {
        const timeDifferenceInMinutes =
          (currentTime.getTime() - el.createdAt.getTime()) / (1000 * 60);
        if (timeDifferenceInMinutes > 20) return el.id;
      });
      await this.prisma.transaction.deleteMany({
        where: {
          id: {
            in: garbage,
          },
        },
      });
      console.log(`Очистка произведена в ${new Date().toLocaleString()}`);
    }
  } */

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
}

type ResponseCheckStatus = {
  state: 'success' | 'error';
  project: number;
  project_invoice: string;
  user: string;
};
