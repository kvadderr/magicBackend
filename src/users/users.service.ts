import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor (private prisma: PrismaService) {}

  async updatePassword (payload: UpdatePasswordDto, id: string) {
    try {
      const candidate = await this.prisma.user.findUnique({
        where: {
          id
        }
      });

      if (!candidate) {
        throw new HttpException('User with provided id does not exist.', HttpStatus.UNAUTHORIZED)
      }

      const areEqual = await compare(payload.old_password, candidate.password);

      if (!areEqual) {
        throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED);
      }

      return await this.prisma.user.update({
        where: {
          id
        }, 
        data: {
          password: await hash(payload.new_password, 7)
        }
      })
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async create(payload: CreateUserDto) {
    try {
      const candidate = await this.prisma.user.findUnique({
        where: {
          email: payload.email
        }
      })

      if (candidate) {
        throw new HttpException('User with provided credentials already exists.', HttpStatus.CONFLICT);
      }

      return await this.prisma.user.create({
        data: {
          ...(payload),
          password: await hash(payload.password, 7)
        }
      });
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async findByLogin({ email, password }: LoginUserDto) {
    try {
      const candidate = await this.prisma.user.findUnique({
        where: {
          email
        }
      });

      if (!candidate) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const areEqual = await compare(password, candidate.password);

      if (!areEqual) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const { password: p, ...rest} = candidate;

      return candidate;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      console.error(error.message);
      return error;
    }
  }

  findOne({ email }: any) {
    try {
      const candidate = this.prisma.user.findFirst({
        where: {
          email
        }
      });
      if (!candidate) {
        throw new Error('User with provided id does not exist.');
      }
      return candidate;
    } catch (error) {
      console.error(error.message);
      return error;
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (!id) {
        throw new Error('No user id provided.')
      }
      const candidate = this.prisma.user.findUnique({
        where: {
          id
        }
      })
      if (!candidate) {
        throw new Error('User with provided id does not exist.');
      }

      return this.prisma.user.update({
        where: {
          id
        },
        data: updateUserDto,
      })
    } catch (error) {
      console.log(error.message);
      return error;
    }
  }

  remove(id: string) {
    try {
      if (!id) {
        throw new Error('No user id provided.')
      }
      const candidate = this.prisma.user.findUnique({
        where: {
          id
        }
      })
      if (!candidate) {
        throw new Error('User with provided id does not exist.');
      }

      return this.prisma.user.delete({
        where: {
          id
        }
      })
    } catch (error) {
      console.error(error.message)
      return error
    }
  }
}
