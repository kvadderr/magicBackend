import {IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    name: string;

    @ApiProperty({ uniqueItems: true })
    email: string;

    @ApiProperty()
    password: string
}

export class LoginUserDto {
    @ApiProperty()
    @IsNotEmpty() readonly email: string;

    @ApiProperty()
    @IsNotEmpty() readonly password: string;
}

export class UpdatePasswordDto {

    @IsNotEmpty()
    @ApiProperty() new_password: string;

    @IsNotEmpty()
    @ApiProperty() old_password: string;

}
