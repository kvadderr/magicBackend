import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { AuthService } from '../auth.service';
import { BASE_REALM, BASE_RETURN_URL, STEAM_API_KEY } from 'src/core/config';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private readonly authService: AuthService) {
    super({
      returnURL: BASE_RETURN_URL,
      realm: BASE_REALM,
      apiKey: STEAM_API_KEY,
    });
  }

  async validate(identifier: string, profile: any): Promise<any> {
    const user = await this.authService.validateSteamAccount(identifier);
    return user;
  }
}
