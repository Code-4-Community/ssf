import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import CognitoAuthConfig from './aws-exports';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const cognitoAuthority = `https://cognito-idp.${CognitoAuthConfig.region}.amazonaws.com/${CognitoAuthConfig.userPoolId}`;
    console.log(cognitoAuthority);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      _audience: CognitoAuthConfig.userPoolClientId,
      issuer: cognitoAuthority,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: cognitoAuthority + '/.well-known/jwks.json',
      }),
    });
  }

  async validate(payload) {
    return { sub: payload.sub };
  }
}
