import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

import { PantriesController } from './pantries.controller';
import { PantriesService } from './pantries.service';
import { OrdersService } from '../orders/order.service';

const mockPantriesService = mock<PantriesService>();
const mockOrdersService = mock<OrdersService>();

describe('PantriesController', () => {
  let controller: PantriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PantriesController],
      providers: [
        { provide: PantriesService, useValue: mockPantriesService },
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    controller = module.get<PantriesController>(PantriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
