import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import CognitoAuthConfig from './aws-exports';
import { SignUpDto } from './dtos/sign-up.dto';
import { createHmac } from 'crypto';
import { Role } from '../users/types';
import { validateEnv } from '../utils/validation.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
    role,
  }: Omit<SignUpDto, 'password' | 'phone'> & { role: Role }): Promise<string> {
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

      // Add user to the appropriate Cognito group based on their role
      await this.addUserToGroup(email, role);

      return sub ?? '';
    } catch (error) {
      if (error instanceof Error && error.name == 'UsernameExistsException') {
        throw new ConflictException('A user with this email already exists');
      } else {
        throw new InternalServerErrorException('Failed to create user');
      }
    }
  }

  async addUserToGroup(username: string, groupName: string): Promise<void> {
    const command = new AdminAddUserToGroupCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Username: username,
      GroupName: groupName,
    });

    try {
      await this.providerClient.send(command);
    } catch (error) {
      this.logger.error(
        `Failed to add user ${username} to group ${groupName}`,
        error,
      );
      throw new InternalServerErrorException(
        `Failed to add user to group ${groupName}`,
      );
    }
  }

  async removeUserFromGroup(
    username: string,
    groupName: string,
  ): Promise<void> {
    const command = new AdminRemoveUserFromGroupCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Username: username,
      GroupName: groupName,
    });

    try {
      await this.providerClient.send(command);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to remove user from group ${groupName}`,
      );
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
