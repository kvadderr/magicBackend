import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty()
  readonly url: string;
  @ApiProperty()
  readonly mainTitle: string;
  @ApiProperty()
  readonly isHaveSidebar: boolean;
  @ApiProperty()
  readonly items: Item[];
  @ApiProperty()
  readonly mainIcon: string;
}

class Item {
  @ApiProperty()
  readonly title: string;
  @ApiProperty()
  readonly icon: string;
  @ApiProperty()
  readonly html: string;
}
