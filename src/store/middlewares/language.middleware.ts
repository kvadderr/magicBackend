import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let language = req.headers.language;

    if (!language) {
      req.headers.language = 'ru';
    }

    next();
  }
}
