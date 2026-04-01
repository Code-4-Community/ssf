import { Test, TestingModule } from '@nestjs/testing';
import { DonationItemsController } from './donationItems.controller';
import { DonationItemsService } from './donationItems.service';
import { mock } from 'jest-mock-extended';

const mockDonationItemsService = mock<DonationItemsService>();

describe('DonationItemsController', () => {
  let controller: DonationItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonationItemsController],
      providers: [
        { provide: DonationItemsService, useValue: mockDonationItemsService },
      ],
    }).compile();

    controller = module.get<DonationItemsController>(DonationItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
