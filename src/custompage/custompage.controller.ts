import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CustompageService } from './custompage.service';
import { CreatePageDto } from './dto/createPage.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Custom pages')
@Controller('page')
export class CustompageController {
  constructor(private readonly pageService: CustompageService) {}

  @Post('/create')
  createPage(@Body() dto: CreatePageDto) {
    return this.pageService.createPage(dto);
  }

  @Get('/custom/:id')
  getPageByUrl(@Param('id') id: string, @Headers('Language') lang) {
    return this.pageService.getPageByUrl(Number(id), lang);
  }

  @Get('/')
  getAll() {
    return this.pageService.getAll();
  }

  /* @Put('/update')
  updatePage(@Body() dto: CreatePageDto) {
    return this.pageService.createPage(dto);
  } */

  /* @Delete('/delete/:url')
  deletePage(@Param('url') url: string) {
    return this.pageService.deletePage(url);
  } */
}
