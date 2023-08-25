import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatiscticService } from './statisctic.service';
import { Roles } from 'src/auth/guards/roles-guard.decorator';
import { RolesGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('statisctic')
@ApiTags('statisctic')
export class StatiscticController {
  constructor(private readonly statService: StatiscticService) {}

  @Get('/today')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Доход за сегодня' })
  @Roles('ADMINISTRATOR')
  profitToday() {
    return this.statService.profitToday();
  }

  @Get('/last30')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Доход за 30 дней' })
  @Roles('ADMINISTRATOR')
  profitLast30Days() {
    return this.statService.profitLast30Days();
  }

  @Get('/month')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Доход за текущий месяц' })
  @Roles('ADMINISTRATOR')
  profitInThisMonth() {
    return this.statService.profitInThisMonth();
  }

  @Get('/allTime')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Доход за всё время' })
  @Roles('ADMINISTRATOR')
  ProfitAllTime() {
    return this.statService.ProfitAllTime();
  }

  @Get('/perDay')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Разбивка дохода по дням и месяцам' }) //TODO: разбивку по дням есть, надо по месяцам
  @Roles('ADMINISTRATOR')
  profitPerDay() {
    return this.statService.profitPerDay();
  }

  @Get('/randomDate/?')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Доход за выбранный период' })
  @Roles('ADMINISTRATOR')
  ProfitRandomDate(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.statService.ProfitRandomDate(startDate, endDate);
  }

  @Get('/avgDeposite')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Средняя сумма депозита' })
  @Roles('ADMINISTRATOR')
  avarageDeposit() {
    return this.statService.avarageDeposit();
  }

  @Get('/avgDepositePerUser')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Среднее количество депозитов одного пользователя в месяц (считается среди тех, кто совершал депозит)',
  })
  @Roles('ADMINISTRATOR')
  avarageDepositPerUser() {
    return this.statService.avarageDepositPerUser();
  }

  @Get('/profitPerServer')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Доход с каждого сервера' })
  @Roles('ADMINISTRATOR')
  profitOnServer() {
    return this.statService.profitOnServer();
  }

  @Get('/profitPerServerOnRandomDate/?')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Доход с каждого сервера за выбранный период' })
  @Roles('ADMINISTRATOR')
  profitPerServerOnRandomDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statService.profitPerServerOnRandomDate(startDate, endDate);
  }

  @Get('/profitPerItem')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Доход с каждого товара' })
  @Roles('ADMINISTRATOR')
  profitPerItem() {
    return this.statService.profitPerItem();
  }

  @Get('/profitPerItemOnRandomDateOnServer/?')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'Доход с каждого товара за выбранный период / Доход с каждого товара за выбранный период на указанном сервере',
  })
  @Roles('ADMINISTRATOR')
  profitPerItemOnRandomDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('serverId') serverId: string,
  ) {
    return this.statService.profitPerItemOnRandomDate(
      startDate,
      endDate,
      Number(serverId),
    );
  }

  @Get('/countOfProducts')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Количество покупок товара' })
  @Roles('ADMINISTRATOR')
  countOfProducts() {
    return this.statService.countOfProducts();
  }

  @Get('/countOfProductsByRandomDate/?')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Количество покупок товара за выбранный период' })
  @Roles('ADMINISTRATOR')
  countOfProductsByRandomDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statService.countOfProductsByRandomDate(startDate, endDate);
  }

  @Get('/getVisitors/:type')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Количество посетителей за: день, месяц' })
  @Roles('ADMINISTRATOR')
  getVisitors(@Param('type') type: string) {
    return this.statService.getVisitors(type);
  }

  @Get('/getVisitorsPerType/:type')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Разбивка по дням, месяцам ' })
  @Roles('ADMINISTRATOR')
  visitorsPerDayMonth(@Param('type') type: string) {
    return this.statService.visitorsPerDayMonth(type);
  }
}
