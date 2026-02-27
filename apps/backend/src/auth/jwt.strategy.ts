import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import CognitoAuthConfig from './aws-exports';
import { CognitoJwtPayload } from './jwt-payload.interface';
import { User } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    const cognitoAuthority = `https://cognito-idp.${CognitoAuthConfig.region}.amazonaws.com/${CognitoAuthConfig.userPoolId}`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: cognitoAuthority,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${cognitoAuthority}/.well-known/jwks.json`,
      }),
    });
  }

  // This function is natively called when we validate a JWT token
  // Afer confirming that our jwt is valid and our payload is signed,
  // we use the sub field in the payload to find the user in our database
  async validate(payload: CognitoJwtPayload): Promise<User | null> {
    try {
      return await this.usersService.findUserByCognitoId(payload.sub);
    } catch {
      return null; // Passport treats null as unauthenticated → clean 401
    }
  }
}
