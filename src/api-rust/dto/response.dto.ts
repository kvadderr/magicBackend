import { ApiProperty } from '@nestjs/swagger';

export class ResponseApiDto {
  @ApiProperty({ description: 'Success | Error' })
  status: 'Success' | 'Error';
  @ApiProperty()
  data: any;
  @ApiProperty({ description: 'Описание ошибки' })
  message: 'error.message';
}
