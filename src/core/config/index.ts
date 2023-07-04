export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
export const PORT = process.env.PORT || 4500;

export const STEAM_API_KEY =
  process.env.STEAM_API_KEY || 'B9598DCBD84F402096CB3D411AE02396';

export const BASE_STEAM_API_URL =
  process.env.BASE_STEAM_API_URL || 'https://api.steampowered.com/';
export const BASE_RETURN_URL =
  process.env.BASE_RETURN_URL ||
  `http://194.67.113.110:${PORT}/auth/steam/return`;
export const BASE_REALM =
  process.env.BASE_REALM || `http://194.67.113.110:${PORT}/`;
