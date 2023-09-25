import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { SECRET_KEY } from 'src/core/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({
          message: 'Пользователь не авторизован',
        });
      }

      const user = this.jwtService.verify(token, { secret: SECRET_KEY });
      if (!user) {
        throw new HttpException('Токен истек', HttpStatus.UNAUTHORIZED);
      }
      req.user = user;
      return true;
    } catch (e) {
      if (req.headers.language == 'ru') {
        throw new HttpException(
          'Пользователь не авторизован',
          HttpStatus.NOT_ACCEPTABLE,
        );
      } else {
        throw new HttpException(
          'You are not logged in',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    }
  }
}
