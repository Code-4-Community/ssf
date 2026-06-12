import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import {
  AdminDisableUserCommand,
  AdminEnableUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AuthService } from './auth.service';
import CognitoAuthConfig from './aws-exports';

describe('AuthService', () => {
  let service: AuthService;
  let sendSpy: jest.SpyInstance;

  beforeEach(async () => {
    process.env.AWS_ACCESS_KEY_ID = 'test';
    process.env.AWS_SECRET_ACCESS_KEY = 'test';
    process.env.COGNITO_CLIENT_SECRET = 'test';
    process.env.AWS_REGION = 'us-east-1';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);

    sendSpy = jest
      .spyOn(
        (service as unknown as { providerClient: { send: jest.Mock } })
          .providerClient,
        'send',
      )
      .mockResolvedValue({} as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('adminDisableUser', () => {
    it('sends AdminDisableUserCommand with the email as Username', async () => {
      await service.adminDisableUser('volunteer@example.com');

      expect(sendSpy).toHaveBeenCalledTimes(1);
      const command = sendSpy.mock.calls[0][0];
      expect(command).toBeInstanceOf(AdminDisableUserCommand);
      expect(command.input).toEqual({
        UserPoolId: CognitoAuthConfig.userPoolId,
        Username: 'volunteer@example.com',
      });
    });

    it('throws InternalServerErrorException when Cognito fails', async () => {
      sendSpy.mockRejectedValueOnce(new Error('Cognito down'));

      await expect(
        service.adminDisableUser('volunteer@example.com'),
      ).rejects.toThrow(
        new InternalServerErrorException('Failed to disable user'),
      );
    });
  });

  describe('adminEnableUser', () => {
    it('sends AdminEnableUserCommand with the email as Username', async () => {
      await service.adminEnableUser('volunteer@example.com');

      expect(sendSpy).toHaveBeenCalledTimes(1);
      const command = sendSpy.mock.calls[0][0];
      expect(command).toBeInstanceOf(AdminEnableUserCommand);
      expect(command.input).toEqual({
        UserPoolId: CognitoAuthConfig.userPoolId,
        Username: 'volunteer@example.com',
      });
    });

    it('throws InternalServerErrorException when Cognito fails', async () => {
      sendSpy.mockRejectedValueOnce(new Error('Cognito down'));

      await expect(
        service.adminEnableUser('volunteer@example.com'),
      ).rejects.toThrow(
        new InternalServerErrorException('Failed to enable user'),
      );
    });
  });
});
