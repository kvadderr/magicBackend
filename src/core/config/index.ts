export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
export const PORT = process.env.PORT || 4500;

export const STEAM_API_KEY =
  process.env.STEAM_API_KEY || 'B9598DCBD84F402096CB3D411AE02396';
export const BASE_IP = process.env.BASE_IP || `http://localhost`;
export const BASE_STEAM_API_URL =
  process.env.BASE_STEAM_API_URL || 'https://api.steampowered.com/';
export const BASE_RETURN_URL =
  process.env.BASE_RETURN_URL || `http://localhost:3001/profile`;
export const BASE_REALM = process.env.BASE_REALM || `http://localhost:3001/`;
export const SECRET_KEY = process.env.SECRET_KEY || 'SQGmGagfJt797J9p';

export const secureRequst = true;
export const httpOnlyRequest = true;
export const sameSiteRequest = 'lax';

export const expiresAccessToken = '7d';
