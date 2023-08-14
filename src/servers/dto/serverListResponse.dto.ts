import { ApiProperty } from '@nestjs/swagger';

export class ResponseServerListDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  serverTypeId: number;
  @ApiProperty()
  IP: String;
  @ApiProperty()
  port: String;
  @ApiProperty()
  apiKey: String;
  @ApiProperty()
  name: String;
  @ApiProperty()
  serverID: number;
}
