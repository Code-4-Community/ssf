import { Injectable } from '@nestjs/common';
import {
  AdminDeleteUserCommand,
  AttributeType,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  ListUsersCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import CognitoAuthConfig from './aws-exports';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { createHmac } from 'crypto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Status } from '../users/types';
import { ConfirmPasswordDto } from './dtos/confirm-password.dto';

@Injectable()
export class AuthService {
  private readonly providerClient: CognitoIdentityProviderClient;
  private readonly clientSecret: string;

  constructor() {
    this.providerClient = new CognitoIdentityProviderClient({
      region: CognitoAuthConfig.region,
      credentials: {
        accessKeyId: process.env.NX_AWS_ACCESS_KEY,
        secretAccessKey: process.env.NX_AWS_SECRET_ACCESS_KEY,
      },
    });

    this.clientSecret = process.env.COGNITO_CLIENT_SECRET;
  }

  // Computes secret hash to authenticate this backend to Cognito
  // Hash key is the Cognito client secret, message is username + client ID
  // Username value depends on the command
  // (see https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash)
  calculateHash(username: string): string {
    const hmac = createHmac('sha256', this.clientSecret);
    hmac.update(username + CognitoAuthConfig.clientId);
    return hmac.digest('base64');
  }

  async getUser(userSub: string): Promise<AttributeType[]> {
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Filter: `sub = "${userSub}"`,
    });

    // TODO need error handling
    const { Users } = await this.providerClient.send(listUsersCommand);
    return Users[0].Attributes;
  }

  async signup(
    { firstName, lastName, email, password }: SignUpDto,
    status: Status = Status.STANDARD,
  ): Promise<boolean> {
    // Needs error handling
    const signUpCommand = new SignUpCommand({
      ClientId: CognitoAuthConfig.clientId,
      SecretHash: this.calculateHash(email),
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'name',
          Value: `${firstName} ${lastName}`,
        },
        // Optional: add a custom Cognito attribute called "role" that also stores the user's status/role
        // If you choose to do so, you'll have to first add this custom attribute in your user pool
        {
          Name: 'custom:role',
          Value: status,
        },
      ],
    });

    const response = await this.providerClient.send(signUpCommand);
    return response.UserConfirmed;
  }

  async verifyUser(email: string, verificationCode: string): Promise<void> {
    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: CognitoAuthConfig.clientId,
      SecretHash: this.calculateHash(email),
      Username: email,
      ConfirmationCode: verificationCode,
    });

    await this.providerClient.send(confirmCommand);
  }

  async signin({ email, password }: SignInDto): Promise<SignInResponseDto> {
    const signInCommand = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CognitoAuthConfig.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: this.calculateHash(email),
      },
    });

    const response = await this.providerClient.send(signInCommand);

    return {
      accessToken: response.AuthenticationResult.AccessToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      idToken: response.AuthenticationResult.IdToken,
    };
  }

  // Refresh token hash uses a user's sub (unique ID), not their username (typically their email)
  async refreshToken(
    { refreshToken }: RefreshTokenDto,
    userSub: string,
  ): Promise<SignInResponseDto> {
    const refreshCommand = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CognitoAuthConfig.clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        SECRET_HASH: this.calculateHash(userSub),
      },
    });

    const response = await this.providerClient.send(refreshCommand);

    return {
      accessToken: response.AuthenticationResult.AccessToken,
      refreshToken: refreshToken,
      idToken: response.AuthenticationResult.IdToken,
    };
  }

  async forgotPassword(email: string) {
    const forgotCommand = new ForgotPasswordCommand({
      ClientId: CognitoAuthConfig.clientId,
      Username: email,
      SecretHash: this.calculateHash(email),
    });

    await this.providerClient.send(forgotCommand);
  }

  async confirmForgotPassword({
    email,
    confirmationCode,
    newPassword,
  }: ConfirmPasswordDto) {
    const confirmComamnd = new ConfirmForgotPasswordCommand({
      ClientId: CognitoAuthConfig.clientId,
      SecretHash: this.calculateHash(email),
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    await this.providerClient.send(confirmComamnd);
  }

  async deleteUser(email: string): Promise<void> {
    const adminDeleteUserCommand = new AdminDeleteUserCommand({
      Username: email,
      UserPoolId: CognitoAuthConfig.userPoolId,
    });

    await this.providerClient.send(adminDeleteUserCommand);
  }
}
