import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import CognitoAuthConfig from './aws-exports';
import { SignUpDto } from './dtos/sign-up.dto';
import { createHmac } from 'crypto';
import { validateEnv } from '../utils/validation.utils';

@Injectable()
export class AuthService {
  private readonly providerClient: CognitoIdentityProviderClient;
  private readonly clientSecret: string;

  constructor() {
    this.providerClient = new CognitoIdentityProviderClient({
      region: CognitoAuthConfig.region,
      credentials: {
        accessKeyId: validateEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: validateEnv('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.clientSecret = validateEnv('COGNITO_CLIENT_SECRET');
  }

  // Computes secret hash to authenticate this backend to Cognito
  // Hash key is the Cognito client secret, message is username + client ID
  // Username value depends on the command
  // (see https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash)
  calculateHash(username: string): string {
    const hmac = createHmac('sha256', this.clientSecret);
    hmac.update(username + CognitoAuthConfig.userPoolClientId);
    return hmac.digest('base64');
  }

  async adminCreateUser({
    firstName,
    lastName,
    email,
  }: Omit<SignUpDto, 'password' | 'phone'>): Promise<string> {
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'name', Value: `${firstName} ${lastName}` },
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
      ],
      DesiredDeliveryMediums: ['EMAIL'],
    });

    try {
      const response = await this.providerClient.send(createUserCommand);
      const sub = response.User?.Attributes?.find(
        (attr) => attr.Name === 'sub',
      )?.Value;
      return sub ?? '';
    } catch (error) {
      if (error instanceof Error && error.name == 'UsernameExistsException') {
        throw new ConflictException('A user with this email already exists');
      } else {
        throw new InternalServerErrorException('Failed to create user');
      }
    }
  }

  async adminDisableUser(email: string): Promise<void> {
    const disableUserCommand = new AdminDisableUserCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Username: email,
    });

    try {
      await this.providerClient.send(disableUserCommand);
    } catch {
      throw new InternalServerErrorException('Failed to disable user');
    }
  }

  async adminEnableUser(email: string): Promise<void> {
    const enableUserCommand = new AdminEnableUserCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Username: email,
    });

    try {
      await this.providerClient.send(enableUserCommand);
    } catch {
      throw new InternalServerErrorException('Failed to enable user');
    }
  }
}
