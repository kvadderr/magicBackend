import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as UAParser from 'ua-parser-js';

declare global {
  namespace Express {
    export interface Request {
      deviceType?: string;
      deviceName?: string;
      browser?: string;
      clientIp?: string;
      os?: string;
    }
  }
}

@Injectable()
export class UserAgentMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const parser = new UAParser();
    parser.setUA(req.headers['user-agent']);

    const device = parser.getDevice();

    if (device.model) {
      if (device.type == 'Macintosh') {
        req.deviceType = 'Macbook';
        req.deviceName = device.model;
      } else {
        req.deviceType = device.type;
        req.deviceName = device.model;
      }
    } else {
      req.deviceType = 'pc';
      req.deviceName = 'pc';
    }

    const os = parser.getOS();
    if (!os.name && !os.version) {
      req.os = 'default windows';
    } else {
      req.os = os.name + ' ' + os.version;
    }

    if (parser.getBrowser().name) {
      req.browser = parser.getBrowser().name;
    } else {
      req.browser = 'postman';
    }

    const clientIp = req.headers['x-real-ip'];

    req.clientIp = clientIp.toString();

    next();
  }
}
