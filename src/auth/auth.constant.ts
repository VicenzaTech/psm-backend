export interface IJWTPayload {
  username: string;
  email: string;
  id: number;
}

export const COOKIE_KEY = {
  REFRESH_TOKEN_KEY: 'x-refresh',
  SESSION_ID_KEY: 'x-session-id',
};


