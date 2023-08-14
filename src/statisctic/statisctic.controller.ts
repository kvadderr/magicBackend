import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { StatiscticService } from './statisctic.service';
import { Roles } from 'src/auth/guards/roles-guard.decorator';
import { RolesGuard } from 'src/auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('statisctic')
@ApiTags('statisctic')
export class StatiscticController {
  constructor(private readonly statService: StatiscticService) {}

  @Get('/today')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  profitToday() {
    return this.statService.profitToday();
  }

  @Get('/last30')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  profitLast30Days() {
    return this.statService.profitLast30Days();
  }

  @Get('/month')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  profitInThisMonth() {
    return this.statService.profitInThisMonth();
  }

  @Get('/allTime')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  ProfitAllTime() {
    return this.statService.ProfitAllTime();
  }

  @Get('/perDay')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  profitPerDay() {
    return this.statService.profitPerDay();
  }

  @Get('/randomDate/?')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  ProfitRandomDate(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.statService.ProfitRandomDate(startDate, endDate);
  }

  @Get('/avgDeposite')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  avarageDeposit() {
    return this.statService.avarageDeposit();
  }

  @Get('/avgDepositePerUser')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  avarageDepositPerUser() {
    return this.statService.avarageDepositPerUser();
  }

  @Get('/profitPerServer')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  profitOnServer() {
    return this.statService.profitOnServer();
  }

  @Get('/profitPerServerOnRandomDate/?')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  profitPerServerOnRandomDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statService.profitPerServerOnRandomDate(startDate, endDate);
  }

  @Get('/profitPerItem')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  profitPerItem() {
    return this.statService.profitPerItem();
  }

  @Get('/profitPerItemOnRandomDate/?')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRATOR')
  profitPerItemOnRandomDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statService.profitPerServerOnRandomDate(startDate, endDate);
  }
}
