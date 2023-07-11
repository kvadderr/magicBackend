import { ApiProperty } from '@nestjs/swagger';
import {
  EStatusOfProductInInventory,
  ETypeOfProduct,
  ServerType,
} from '@prisma/client';

export class ProductDto {
  @ApiProperty()
  name: String;
  @ApiProperty()
  nameID: String;
  @ApiProperty()
  description: String;
  @ApiProperty()
  image: String;
  @ApiProperty()
  type: ETypeOfProduct;
  @ApiProperty()
  productContent: JSON;
  @ApiProperty()
  serverType: ServerType;
  @ApiProperty()
  isChangeAmount: Boolean;
  @ApiProperty()
  price: number;
  @ApiProperty()
  discount: number;
  @ApiProperty()
  saleDiscount: number;
  @ApiProperty()
  saleDeadline: Date;
  @ApiProperty()
  maxCountOfSale: number;
  @ApiProperty()
  hidden: Boolean;
  @ApiProperty()
  number: number;
  @ApiProperty()
  autoactivation: Boolean;

  @ApiProperty()
  isBackground: Boolean;
  @ApiProperty()
  previewImage: String;
  @ApiProperty()
  blockSize: number;
  @ApiProperty()
  label: number;
  @ApiProperty()
  isBackgroundImage: Boolean;
}
export class InventoryResponseDto {
  @ApiProperty()
  readonly id: number;
  @ApiProperty()
  readonly amount: number;
  @ApiProperty()
  readonly status: EStatusOfProductInInventory;
  @ApiProperty()
  readonly dateOfReceive: Date;
  @ApiProperty()
  readonly historyOfPurchaseId: number;
  @ApiProperty()
  readonly userId: number;
  @ApiProperty()
  readonly serverTypeId: number;
  @ApiProperty()
  readonly serverId: number;
  @ApiProperty()
  readonly serverName: string;
  @ApiProperty()
  readonly productId: number;
  @ApiProperty()
  readonly product: ProductDto;
}

export class StantardResponseDto {
  @ApiProperty()
  readonly message: string;
  @ApiProperty()
  readonly status: 'Success' | 'Error';
  @ApiProperty()
  readonly data: JSON;
}
