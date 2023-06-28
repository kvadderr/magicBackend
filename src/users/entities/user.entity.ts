import { ApiProperty } from "@nestjs/swagger";

export class User {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ uniqueItems: true })
    email: string;

    @ApiProperty()
    password: string
}
