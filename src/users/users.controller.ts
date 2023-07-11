import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/whoAmI/:token')
  async whoAmI(@Param('token') token: string) {
    return this.userService.whoAmI(token);
  }
}
