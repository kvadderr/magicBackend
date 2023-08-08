import { Controller, Get } from '@nestjs/common';
import { StatiscticService } from './statisctic.service';

@Controller('statisctic')
export class StatiscticController {
  constructor(private readonly statService: StatiscticService) {}

  @Get('/')
  profitToday() {
    return this.statService.profitLast30Days();
  }
}
