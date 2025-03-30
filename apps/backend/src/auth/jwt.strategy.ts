import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import CognitoAuthConfig from './aws-exports';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    const cognitoAuthority = `https://cognito-idp.${CognitoAuthConfig.region}.amazonaws.com/${CognitoAuthConfig.userPoolId}`;

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
    // add DB user to request here b/c controller guards run first (gross)
    // https://docs.nestjs.com/faq/request-lifecycle#filters
    // console.log(payload);
    const user = await this.authService.getUser(payload.sub);
    const dbUser = await this.usersService.findByEmail(user.email);
    // console.log(dbUser)
    return dbUser;
  }
}
