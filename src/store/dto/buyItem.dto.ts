import { ApiProperty } from '@nestjs/swagger';

export class BuyItemDto {
  @ApiProperty()
  readonly productId: number;
  @ApiProperty()
  readonly amount: number;
}
