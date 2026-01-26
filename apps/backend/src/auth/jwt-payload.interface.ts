export interface CognitoJwtPayload {
  sub: string;
  email?: string;
  username?: string;
  aud?: string;
  iss?: string;
  exp?: number;
  iat?: number;
}
