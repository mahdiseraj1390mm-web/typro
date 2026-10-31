import { Controller, Get, Post, Body, Query, Param, NotFoundException } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  getAll(@Query('category') category?: string, @Query('language') language?: string) {
    return this.contentService.getAll(category, language);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    const item = this.contentService.getById(id);
    if (!item) throw new NotFoundException('محتوای مورد نظر یافت نشد');
    return item;
  }

  @Post()
  create(@Body() body: any) {
    return this.contentService.create(body);
  }
}
