import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { StatiscticService } from './statisctic.service';
import { Roles } from 'src/auth/guards/roles-guard.decorator';
import { RolesGuard } from 'src/auth/guards/auth.guard';

@Controller('statisctic')
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
}
