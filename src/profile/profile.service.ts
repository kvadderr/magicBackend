import { Injectable } from '@nestjs/common';
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

  async getInventory(token: string) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      const user = await this.userSerivce.findById(isUser.id);

      return this.prisma.inventory.findMany({
        where: {
          userId: user.id,
          status: 'INVENTORY',
        },
        include: {
          product: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getDetalization(
    token: string,
    pageNumber: number,
    selectNumber: number,
  ) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

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

      result.sort((a, b) => b.createdAt - a.createdAt);
      return result.slice(
        pageNumber * selectNumber,
        (pageNumber + 1) * selectNumber,
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBalance(token: string) {
    try {
      const isUser = await this.tokenService.validateAccessToken(token);

      const user = await this.userSerivce.findById(isUser.id);

      return { balance: user.mainBalance + user.bonusBalance };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
