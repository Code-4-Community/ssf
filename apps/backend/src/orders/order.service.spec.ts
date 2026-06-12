import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './order.service';
import { Order } from './order.entity';
import { testDataSource } from '../config/typeormTestDataSource';
import { OrderStatus, VolunteerAction } from './types';
import { Pantry } from '../pantries/pantries.entity';
import { OrderDetailsDto } from './dtos/order-details.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BulkUpdateTrackingCostDto } from './dtos/bulk-update-tracking-cost.dto';
import { FoodType } from '../donationItems/types';
import { FoodRequest } from '../foodRequests/request.entity';
import 'multer';
import { FoodRequestStatus } from '../foodRequests/types';
import { RequestsService } from '../foodRequests/request.service';
import { FoodManufacturersService } from '../foodManufacturers/manufacturers.service';
import { DonationItemsService } from '../donationItems/donationItems.service';
import { AllocationsService } from '../allocations/allocations.service';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import { UsersService } from '../users/users.service';
import { DonationItem } from '../donationItems/donationItems.entity';
import { Donation } from '../donations/donations.entity';
import { DonationStatus } from '../donations/types';
import { User } from '../users/users.entity';
import { AuthService } from '../auth/auth.service';
import { DonationService } from '../donations/donations.service';
import { PantriesService } from '../pantries/pantries.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { DataSource, EntityManager, In } from 'typeorm';
import { EmailsService } from '../emails/email.service';
import { Allocation } from '../allocations/allocations.entity';
import { mock } from 'jest-mock-extended';
import { emailTemplates, EMAIL_REDIRECT_URL } from '../emails/emailTemplates';
import { ApplicationStatus } from '../shared/types';

// Set 1 minute timeout for async DB operations
jest.setTimeout(60000);

const mockEmailsService = mock<EmailsService>();

describe('OrdersService', () => {
  let service: OrdersService;
  let donationService: DonationService;

  beforeAll(async () => {
    mockEmailsService.sendEmails.mockResolvedValue(undefined);

    // Initialize DataSource once
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    // Clean database at the start
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        RequestsService,
        FoodManufacturersService,
        DonationItemsService,
        AllocationsService,
        UsersService,
        PantriesService,
        DonationService,
        {
          provide: DataSource,
          useValue: testDataSource,
        },
        {
          provide: EmailsService,
          useValue: mockEmailsService,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: testDataSource.getRepository(Order),
        },
        {
          provide: getRepositoryToken(FoodManufacturer),
          useValue: testDataSource.getRepository(FoodManufacturer),
        },
        {
          provide: getRepositoryToken(Pantry),
          useValue: testDataSource.getRepository(Pantry),
        },
        {
          provide: getRepositoryToken(FoodRequest),
          useValue: testDataSource.getRepository(FoodRequest),
        },
        {
          provide: getRepositoryToken(DonationItem),
          useValue: testDataSource.getRepository(DonationItem),
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: testDataSource.getRepository(Donation),
        },
        {
          provide: getRepositoryToken(Allocation),
          useValue: testDataSource.getRepository(Allocation),
        },
        {
          provide: getRepositoryToken(User),
          useValue: testDataSource.getRepository(User),
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: EmailsService,
          useValue: mockEmailsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    donationService = module.get<DonationService>(DonationService);
  });

  beforeEach(async () => {
    mockEmailsService.sendEmails.mockClear();
    await testDataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
    await testDataSource.runMigrations();
  });

  afterEach(async () => {
    // Drop the schema completely (cascades all tables)
    await testDataSource.query(`DROP SCHEMA public CASCADE`);
    await testDataSource.query(`CREATE SCHEMA public`);
  });

  afterAll(async () => {
    // Destroy all schemas
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('returns orders filtered by status', async () => {
      const orders = await service.getAll({ status: OrderStatus.DELIVERED });

      expect(orders).toHaveLength(2);
      expect(
        orders.every((order) => order.status === OrderStatus.DELIVERED),
      ).toBe(true);
    });

    it('returns empty array when status filter matches nothing', async () => {
      // Delete allocations referencing pending orders, then delete orders themselves
      await testDataSource.query(
        `DELETE FROM "allocations" WHERE order_id IN (SELECT order_id FROM "orders" WHERE status = $1)`,
        [OrderStatus.PENDING],
      );
      await testDataSource.query(`DELETE FROM "orders" WHERE status = $1`, [
        OrderStatus.PENDING,
      ]);

      const orders = await service.getAll({ status: OrderStatus.PENDING });
      expect(orders).toEqual([]);
    });

    it('returns orders filtered by pantry names', async () => {
      const orders = await service.getAll({
        pantryNames: ['Community Food Pantry Downtown'],
      });

      expect(orders).toHaveLength(2);
      expect(
        orders.every(
          (order) =>
            order.request.pantry.pantryName ===
            'Community Food Pantry Downtown',
        ),
      ).toBe(true);
    });

    it('returns empty array when pantry filter matches nothing', async () => {
      const orders = await service.getAll({
        pantryNames: ['Nonexistent Pantry'],
      });

      expect(orders).toEqual([]);
    });

    it('returns orders filtered by both pantry and status', async () => {
      const orders = await service.getAll({
        status: OrderStatus.DELIVERED,
        pantryNames: ['Westside Community Kitchen'],
      });

      expect(orders).toHaveLength(1);
      expect(orders[0].request.pantry.pantryName).toBe(
        'Westside Community Kitchen',
      );
      expect(orders[0].status).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('getRecentOrdersByAssignee', () => {
    it('returns empty array when volunteer has no assigned orders', async () => {
      // assign all seed orders away from volunteer 6
      await testDataSource.query(
        `UPDATE orders SET assignee_id = (SELECT user_id FROM users WHERE role = 'volunteer' AND user_id != 6 LIMIT 1)`,
      );

      const result = await service.getRecentOrdersByAssignee(6);
      expect(result).toEqual([]);
    });

    it('returns at most 2 orders even when volunteer has more', async () => {
      // assign all seed orders to volunteer 6
      await testDataSource.query(`UPDATE orders SET assignee_id = 6`);

      const result = await service.getRecentOrdersByAssignee(6);
      expect(result).toHaveLength(2);
    });

    it('returns correct shape of orders', async () => {
      await testDataSource.query(`UPDATE orders SET assignee_id = 6`);

      const result = await service.getRecentOrdersByAssignee(6);

      expect(result[0].createdAt >= result[1].createdAt).toBe(true);
      result.forEach((order) => {
        expect(order.pantryName).toBeDefined();
        expect(order.assignee.id).toBe(6);
        expect(order.assignee.firstName).toBe('James');
        expect(order.assignee.lastName).toBe('Thomas');
        expect(order.orderId).toBeDefined();
        expect(order.status).toBeDefined();
        expect(order.createdAt).toBeDefined();
        expect(order.shippedAt).toBeDefined();
        expect(order.deliveredAt).toBeDefined();
      });
    });
  });

  describe('findOrderDetails', () => {
    it('returns mapped OrderDetailsDto including allocations and manufacturer', async () => {
      const orderId = 1;

      const result = await service.findOrderDetails(orderId);

      const expected: OrderDetailsDto = {
        orderId: 1,
        status: OrderStatus.DELIVERED,
        foodManufacturerName: 'FoodCorp Industries',
        shippingCost: 8.0,
        trackingLink: 'https://www.samplelink.com/samplelink',
        items: [
          {
            id: 1,
            foodType: FoodType.SEED_BUTTERS,
            name: 'Peanut Butter (16oz)',
            quantity: 10,
          },
          {
            id: 2,
            foodType: FoodType.GLUTEN_FREE_BREAD,
            name: 'Whole Wheat Bread',
            quantity: 25,
          },
          {
            id: 3,
            foodType: FoodType.REFRIGERATED_MEALS,
            name: 'Canned Green Beans',
            quantity: 5,
          },
        ],
      };

      expect(result).toMatchObject({
        orderId: expected.orderId,
        status: expected.status,
        foodManufacturerName: expected.foodManufacturerName,
        trackingLink: expected.trackingLink,
      });

      expect(result.items).toHaveLength(expected.items.length);
      expect(result.items).toEqual(expect.arrayContaining(expected.items));
    });

    it('throws NotFoundException when order does not exist', async () => {
      const missingOrderId = 99999999;

      await expect(service.findOrderDetails(missingOrderId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOrderDetails(missingOrderId)).rejects.toThrow(
        `Order ${missingOrderId} not found`,
      );
    });
  });

  describe('findOne', () => {
    it('returns order by ID', async () => {
      const orderId = 1;
      const result = await service.findOne(orderId);

      expect(result).toBeDefined();
      expect(result.orderId).toBe(1);
    });

    it('throws NotFoundException for non-existent order', async () => {
      await expect(service.findOne(9999)).rejects.toThrow(
        new NotFoundException('Order 9999 not found'),
      );
    });
  });

  describe('findOrderFoodRequest', () => {
    it('returns food request of order', async () => {
      const foodRequest = await service.findOrderFoodRequest(1);

      expect(foodRequest).toBeDefined();
      expect(foodRequest.requestId).toBe(1);
    });

    it('throws NotFoundException for non-existent order', async () => {
      await expect(service.findOrderFoodRequest(9999)).rejects.toThrow(
        new NotFoundException('Order 9999 not found'),
      );
    });
  });

  describe('findOrderPantry', () => {
    it('returns pantry of order', async () => {
      const pantry = await service.findOrderPantry(1);

      expect(pantry).toBeDefined();
      expect(pantry.pantryName).toEqual('Community Food Pantry Downtown');
      expect(pantry.pantryId).toEqual(1);
    });
  });

  describe('updateStatus', () => {
    it('updates order status to delivered', async () => {
      const orderId = 3;
      const order = await service.findOne(orderId);

      expect(order.status).toEqual(OrderStatus.SHIPPED);
      expect(order.shippedAt).toBeDefined();

      await service.updateStatus(orderId, OrderStatus.DELIVERED);
      const updatedOrder = await service.findOne(orderId);

      expect(updatedOrder.status).toEqual(OrderStatus.DELIVERED);
      expect(updatedOrder.deliveredAt).toBeDefined();
    });

    it('updates order status to shipped', async () => {
      const orderId = 4;
      const order = await service.findOne(orderId);

      expect(order.status).toEqual(OrderStatus.PENDING);

      await service.updateStatus(orderId, OrderStatus.SHIPPED);
      const updatedOrder = await service.findOne(orderId);

      expect(updatedOrder.status).toEqual(OrderStatus.SHIPPED);
      expect(updatedOrder.shippedAt).toBeDefined();
      expect(updatedOrder.deliveredAt).toBeNull();
    });
  });

  describe('getOrdersByPantry', () => {
    it('returns order from pantry ID', async () => {
      const pantryId = 1;
      const orders = await service.getOrdersByPantry(pantryId);

      expect(orders.length).toBe(2);
      expect(orders.every((order) => order.request.pantryId === 1)).toBe(true);
    });

    it('returns empty list for pantry with no orders', async () => {
      const pantryId = 5;
      const orders = await service.getOrdersByPantry(pantryId);

      expect(orders).toEqual([]);
    });

    it('throws NotFoundException for non-existent pantry', async () => {
      const pantryId = 9999;

      await expect(service.getOrdersByPantry(pantryId)).rejects.toThrow(
        new NotFoundException(`Pantry ${pantryId} not found`),
      );
    });
  });

  describe('confirmDelivery', () => {
    it('should throw BadRequestException for invalid date format', async () => {
      await expect(
        service.confirmDelivery(
          1,
          { dateReceived: 'invalid-date', feedback: 'test feedback' },
          [],
        ),
      ).rejects.toThrow(
        new BadRequestException('Invalid date format for dateReceived'),
      );
    });

    it('should update order with delivery details and set status to delivered and update request status to closed', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const requestRepo = testDataSource.getRepository(FoodRequest);

      const shippedOrder = await orderRepo.findOne({
        where: { status: OrderStatus.SHIPPED, orderId: 3 },
        relations: ['request'],
      });

      expect(shippedOrder).toBeDefined();

      if (!shippedOrder) throw new Error('Missing shipped order test object');

      const now = new Date();
      now.setMilliseconds(0);
      const dateReceived = now.toISOString();
      const feedback = 'Perfect delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      await service.confirmDelivery(
        shippedOrder.orderId,
        { dateReceived, feedback },
        photos,
      );

      const updatedOrder = await service.findOne(shippedOrder.orderId);
      expect(updatedOrder.orderId).toBe(shippedOrder.orderId);
      expect(updatedOrder.status).toBe(OrderStatus.DELIVERED);
      expect(updatedOrder.dateReceived).toEqual(new Date(dateReceived));
      expect(updatedOrder.feedback).toBe(feedback);
      expect(updatedOrder.photos).toEqual(photos);
      expect(updatedOrder.deliveredAt).toBeNull();

      const updatedRequest = await requestRepo.findOne({
        where: { requestId: shippedOrder.requestId },
        relations: ['orders'],
      });

      if (!updatedRequest)
        throw new Error('Missing updatedRequest test object');

      expect(updatedRequest.status).toBe(FoodRequestStatus.CLOSED);
    });

    it('should update order with delivery details and set status to delivered but request remains active', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const requestRepo = testDataSource.getRepository(FoodRequest);
      // Get an existing shipped order
      const existingShippedOrder = await orderRepo.findOne({
        where: { status: OrderStatus.SHIPPED },
        relations: ['request'],
      });

      expect(existingShippedOrder).toBeDefined();

      if (!existingShippedOrder)
        throw new Error('Missing existingShippedOrder test object');

      // Add a second shipped order to the same request so it stays active after delivery
      const secondOrder = orderRepo.create({
        requestId: existingShippedOrder.requestId,
        foodManufacturerId: existingShippedOrder.foodManufacturerId,
        assigneeId: existingShippedOrder.assigneeId,
        status: OrderStatus.SHIPPED,
        shippedAt: new Date(),
      });
      await orderRepo.save(secondOrder);

      const now = new Date();
      now.setMilliseconds(0);
      const dateReceived = now.toISOString();
      const feedback = 'Perfect delivery!';
      const photos = ['photo1.jpg', 'photo2.jpg'];

      await service.confirmDelivery(
        existingShippedOrder.orderId,
        { dateReceived, feedback },
        photos,
      );

      const updatedOrder = await service.findOne(existingShippedOrder.orderId);
      expect(updatedOrder.orderId).toBe(existingShippedOrder.orderId);
      expect(updatedOrder.status).toBe(OrderStatus.DELIVERED);
      expect(updatedOrder.dateReceived).toEqual(new Date(dateReceived));
      expect(updatedOrder.feedback).toBe(feedback);
      expect(updatedOrder.photos).toEqual(photos);

      const updatedRequest = await requestRepo.findOne({
        where: { requestId: existingShippedOrder.requestId },
        relations: ['orders'],
      });

      if (!updatedRequest)
        throw new Error('Missing updatedRequest test object');

      expect(updatedRequest.status).toBe(FoodRequestStatus.ACTIVE);
    });

    it('should throw NotFoundException for invalid order id', async () => {
      const invalidOrderId = 99999;

      await expect(
        service.confirmDelivery(
          invalidOrderId,
          { dateReceived: new Date().toISOString(), feedback: 'test' },
          [],
        ),
      ).rejects.toThrow(
        new NotFoundException(`Order ${invalidOrderId} not found`),
      );
    });

    it('should throw BadRequestException when order is not shipped', async () => {
      const orderRepo = testDataSource.getRepository(Order);

      const pendingOrder = await orderRepo.findOne({
        where: { status: OrderStatus.PENDING },
      });

      expect(pendingOrder).toBeDefined();

      if (!pendingOrder) throw new Error('Missing pendingOrder test object');

      await expect(
        service.confirmDelivery(
          pendingOrder.orderId,
          { dateReceived: new Date().toISOString(), feedback: 'test' },
          [],
        ),
      ).rejects.toThrow(
        new BadRequestException('Can only confirm delivery for shipped orders'),
      );
    });

    it('should throw BadRequestException when order is already delivered', async () => {
      const orderRepo = testDataSource.getRepository(Order);

      const deliveredOrder = await orderRepo.findOne({
        where: { status: OrderStatus.DELIVERED },
      });

      expect(deliveredOrder).toBeDefined();

      if (!deliveredOrder)
        throw new Error('Missing deliveredOrder test object');

      await expect(
        service.confirmDelivery(
          deliveredOrder.orderId,
          { dateReceived: new Date().toISOString(), feedback: 'test' },
          [],
        ),
      ).rejects.toThrow(
        new BadRequestException('Can only confirm delivery for shipped orders'),
      );
    });

    it('sends pantryConfirmsOrderDelivery email to volunteer when delivery is confirmed', async () => {
      const orderId = 3;
      const order = await testDataSource.getRepository(Order).findOne({
        where: { orderId },
        relations: [
          'request',
          'request.pantry',
          'foodManufacturer',
          'assignee',
        ],
      });

      if (!order) throw new Error('Missing order test object');

      await service.confirmDelivery(
        orderId,
        { dateReceived: new Date().toISOString(), feedback: 'Great!' },
        [],
      );

      const message = emailTemplates.pantryConfirmsOrderDelivery({
        volunteerName: `${order.assignee.firstName} ${order.assignee.lastName}`,
        pantryName: order.request.pantry.pantryName,
        fmName: order.foodManufacturer.foodManufacturerName,
      });

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(2);
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
        toEmail: order.assignee.email,
        subject: message.subject,
        bodyHtml: message.bodyHTML,
      });
    });

    it('still updates order to delivered if delivery confirmation email fails to send', async () => {
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('Email failed'),
      );

      await expect(
        service.confirmDelivery(
          3,
          { dateReceived: new Date().toISOString(), feedback: 'Great!' },
          [],
        ),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'Request 3 auto-closed, but failed to send pantry notification email',
        ),
      );

      const order = await service.findOne(3);
      expect(order.status).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('create', () => {
    let validCreateOrderDto: CreateOrderDto;
    let parsedAllocations: Map<number, number>;
    const userId = 3;

    beforeEach(() => {
      validCreateOrderDto = {
        foodRequestId: 1,
        manufacturerId: 1,
        itemAllocations: {
          1: 10,
          2: 3,
        },
      };

      parsedAllocations = new Map<number, number>([
        [1, 10],
        [2, 3],
      ]);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create a new order successfully and send appropriate emails', async () => {
      const allocationRepo = testDataSource.getRepository(Allocation);
      const donationItemRepo = testDataSource.getRepository(DonationItem);
      const donationRepo = testDataSource.getRepository(Donation);
      const usersRepo = testDataSource.getRepository(User);
      const requestRepo = testDataSource.getRepository(FoodRequest);
      const manufacturerRepo = testDataSource.getRepository(FoodManufacturer);

      parsedAllocations.set(9, 5);

      // Initial donation items
      const donationItem1 = (await donationItemRepo.findOne({
        where: { itemId: 1 },
      })) as DonationItem;
      const donationItem2 = (await donationItemRepo.findOne({
        where: { itemId: 2 },
      })) as DonationItem;
      const donationItem3 = (await donationItemRepo.findOne({
        where: { itemId: 9 },
      })) as DonationItem;

      donationItem3.quantity = 100;

      await donationItemRepo.save(donationItem3);

      const createdOrder = await service.create(
        validCreateOrderDto.foodRequestId,
        validCreateOrderDto.manufacturerId,
        parsedAllocations,
        userId,
      );

      expect(createdOrder).toBeDefined();
      expect(createdOrder.orderId).toBeDefined();
      expect(createdOrder.status).toEqual(OrderStatus.PENDING);
      expect(createdOrder.assigneeId).toEqual(userId);
      expect(createdOrder.foodManufacturerId).toEqual(
        validCreateOrderDto.manufacturerId,
      );
      expect(createdOrder.requestId).toEqual(validCreateOrderDto.foodRequestId);

      const allocations = await allocationRepo.find({
        where: { orderId: createdOrder.orderId },
      });
      expect(allocations.length).toBe(parsedAllocations.size);
      expect(allocations.map((a) => a.itemId)).toEqual(
        expect.arrayContaining([1, 2, 9]),
      );
      expect(allocations.map((a) => a.allocatedQuantity)).toEqual(
        expect.arrayContaining([10, 3, 5]),
      );

      const updatedDonationItem1 = (await donationItemRepo.findOne({
        where: { itemId: 1 },
      })) as DonationItem;
      const updatedDonationItem2 = (await donationItemRepo.findOne({
        where: { itemId: 2 },
      })) as DonationItem;
      const updatedDonationItem3 = (await donationItemRepo.findOne({
        where: { itemId: 9 },
      })) as DonationItem;

      expect(updatedDonationItem1.reservedQuantity).toBe(
        donationItem1.reservedQuantity + 10,
      );
      expect(updatedDonationItem2.reservedQuantity).toBe(
        donationItem2.reservedQuantity + 3,
      );
      expect(updatedDonationItem3.reservedQuantity).toBe(
        donationItem3.reservedQuantity + 5,
      );

      const matchedDonation1 = await donationRepo.findOne({
        where: { donationId: 1 },
      });
      expect(matchedDonation1?.status).toBe(DonationStatus.MATCHED);

      const matchedDonation2 = await donationRepo.findOne({
        where: { donationId: 2 },
      });
      expect(matchedDonation2?.status).toBe(DonationStatus.MATCHED);

      // Testing emails section

      const assignee = (await usersRepo.findOne({
        where: { id: userId },
      })) as User;
      const request = (await requestRepo.findOne({
        where: { requestId: validCreateOrderDto.foodRequestId },
        relations: ['pantry', 'pantry.pantryUser'],
      })) as FoodRequest;
      const manufacturer = (await manufacturerRepo.findOne({
        where: { foodManufacturerId: validCreateOrderDto.manufacturerId },
        relations: ['foodManufacturerRepresentative'],
      })) as FoodManufacturer;

      const pantry = request.pantry;
      const pantryAddress = `${request.pantry.shipmentAddressLine1}${
        request.pantry.shipmentAddressLine2
          ? `<br />${request.pantry.shipmentAddressLine2}`
          : ''
      }<br />
${request.pantry.shipmentAddressCity}, ${request.pantry.shipmentAddressState} ${
        request.pantry.shipmentAddressZip
      }${
        request.pantry.shipmentAddressCountry
          ? `<br />${request.pantry.shipmentAddressCountry}`
          : ''
      }`;

      const itemDetails = [
        { quantity: '10', product: updatedDonationItem1.itemName },
        { quantity: '3', product: updatedDonationItem2.itemName },
        { quantity: '5', product: updatedDonationItem3.itemName },
      ];

      const fmMessage = emailTemplates.fmDonationMatchedOrder({
        manufacturerName: manufacturer.foodManufacturerName,
        items: itemDetails,
        pantryName: pantry.pantryName,
        pantryAddress,
        volunteerName: assignee.firstName + ' ' + assignee.lastName,
        volunteerEmail: assignee.email,
      });

      const pantryMessage = emailTemplates.pantryRequestMatchedOrder({
        pantryName: request.pantry.pantryName,
        items: itemDetails,
        brand: manufacturer.foodManufacturerName,
        volunteerName: assignee.firstName + ' ' + assignee.lastName,
        volunteerEmail: assignee.email,
      });

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(2);

      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
        toEmail: request.pantry.pantryUser.email,
        subject: pantryMessage.subject,
        bodyHtml: pantryMessage.bodyHTML,
      });

      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
        toEmail: manufacturer.foodManufacturerRepresentative.email,
        subject: fmMessage.subject,
        bodyHtml: fmMessage.bodyHTML,
      });
    });

    it('should throw BadRequestException if request is not active', async () => {
      const requestRepo = testDataSource.getRepository(FoodRequest);
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      const request = (await requestRepo.findOne({
        where: { requestId: 2 },
      })) as FoodRequest;

      request.status = FoodRequestStatus.CLOSED;
      await requestRepo.save(request);

      validCreateOrderDto.foodRequestId = 2;
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Request ${validCreateOrderDto.foodRequestId} is not active`,
        ),
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw BadRequestException if manufacturer is not approved', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      validCreateOrderDto.foodRequestId = 1;
      // Manufacturer that has status pending
      validCreateOrderDto.manufacturerId = 3;
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Manufacturer ${validCreateOrderDto.manufacturerId} is not approved`,
        ),
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw BadRequestException if manufacturer has no donations', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      await testDataSource.query(
        `UPDATE donations SET food_manufacturer_id = 2 WHERE food_manufacturer_id = $1`,
        [validCreateOrderDto.manufacturerId],
      );

      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Manufacturer ${validCreateOrderDto.manufacturerId} has no donations`,
        ),
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw BadRequestException if allocated quantity exceeds remaining', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      const donationItemId = 2;

      parsedAllocations = new Map<number, number>([
        [donationItemId, 500],
        [1, 10],
      ]);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Donation item ${donationItemId} quantity to allocate exceeds remaining quantity`,
        ),
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw BadRequestException if donation is not associated with manufacturer', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      const donationItemId = 7;
      parsedAllocations = new Map<number, number>([
        [donationItemId, 2],
        [1, 10],
      ]);
      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `The following donation items are not associated with the current food manufacturer: Donation item ID ${donationItemId} with Donation ID 3`,
        ),
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should still create order and send FM email when pantry email fails', async () => {
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('SMTP error'),
      );

      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send pantry request matched order confirmation email',
        ),
      );

      const createdOrder = await service.findOne(5);

      expect(createdOrder.status).toEqual(OrderStatus.PENDING);

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(2);

      const manufacturerRepo = testDataSource.getRepository(FoodManufacturer);
      const manufacturer = (await manufacturerRepo.findOne({
        where: { foodManufacturerId: validCreateOrderDto.manufacturerId },
        relations: ['foodManufacturerRepresentative'],
      })) as FoodManufacturer;
      expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
        toEmail: manufacturer.foodManufacturerRepresentative.email,
        subject: expect.any(String),
        bodyHtml: expect.any(String),
      });
    });

    it('should still create order when both emails fail', async () => {
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('SMTP error'),
      );
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('SMTP error'),
      );

      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to send pantry request matched order confirmation email; Failed to send food manufacturer donation matched order confirmation email',
        ),
      );

      const createdOrder = await service.findOne(5);
      expect(createdOrder.status).toEqual(OrderStatus.PENDING);

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(2);
    });

    it('should call allocationsService.createMultiple once with correct parameters', async () => {
      const spy = jest.spyOn(
        (service as any).allocationsService as AllocationsService,
        'createMultiple',
      );

      const createdOrder = await service.create(
        validCreateOrderDto.foodRequestId,
        validCreateOrderDto.manufacturerId,
        parsedAllocations,
        userId,
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        createdOrder.orderId,
        parsedAllocations,
        expect.any(EntityManager),
      );
    });

    it('should call donationService.matchAll once with correct parameters', async () => {
      const spy = jest.spyOn(
        (service as any).donationService as DonationService,
        'matchAll',
      );

      await service.create(
        validCreateOrderDto.foodRequestId,
        validCreateOrderDto.manufacturerId,
        parsedAllocations,
        userId,
      );

      // Items 1 and 2 both belong to donation_id 1
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.arrayContaining([1]),
        expect.any(EntityManager),
      );
    });

    it('should rollback transaction and not create order if allocation creation fails', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      const orderCountBefore = await orderRepo.count();
      const item1Before = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      const item2Before = await donationItemRepo.findOne({
        where: { itemId: 2 },
      });

      jest
        .spyOn(
          (service as any).allocationsService as AllocationsService,
          'createMultiple',
        )
        .mockRejectedValueOnce(new Error('DB error'));

      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow('DB error');

      const orderCountAfter = await orderRepo.count();
      expect(orderCountAfter).toBe(orderCountBefore);

      const item1After = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      const item2After = await donationItemRepo.findOne({
        where: { itemId: 2 },
      });
      expect(item1After?.reservedQuantity).toBe(item1Before?.reservedQuantity);
      expect(item2After?.reservedQuantity).toBe(item2Before?.reservedQuantity);
    });

    it('should rollback transaction and not create order if donation matching fails', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      const orderCountBefore = await orderRepo.count();
      const item1Before = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      const item2Before = await donationItemRepo.findOne({
        where: { itemId: 2 },
      });

      jest
        .spyOn((service as any).donationService as DonationService, 'matchAll')
        .mockRejectedValueOnce(new Error('DB error'));

      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow('DB error');

      const orderCountAfter = await orderRepo.count();
      expect(orderCountAfter).toBe(orderCountBefore);

      const item1After = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      const item2After = await donationItemRepo.findOne({
        where: { itemId: 2 },
      });
      expect(item1After?.reservedQuantity).toBe(item1Before?.reservedQuantity);
      expect(item2After?.reservedQuantity).toBe(item2Before?.reservedQuantity);
    });

    it('should throw BadRequestException if itemAllocations is empty', async () => {
      const donationItemRepo = testDataSource.getRepository(DonationItem);
      const emptyAllocations = new Map<number, number>();

      await expect(
        service.create(
          validCreateOrderDto.foodRequestId,
          validCreateOrderDto.manufacturerId,
          emptyAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new BadRequestException('Cannot create order with no donation items'),
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('should throw NotFoundException if request is not found', async () => {
      const nonExistentRequestId = 999;
      const donationItemRepo = testDataSource.getRepository(DonationItem);

      await expect(
        service.create(
          nonExistentRequestId,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          userId,
        ),
      ).rejects.toThrow(
        new NotFoundException(`Request ${nonExistentRequestId} not found`),
      );

      // Asserting that donation item reserved quantity wasn't updated
      const donationItem1 = await donationItemRepo.findOne({
        where: { itemId: 1 },
      });
      expect(donationItem1?.reservedQuantity).toBe(10);
    });

    it('throw BadRequestException if pantry is denied', async () => {
      const pantryId = 4;
      await testDataSource.query(`
        UPDATE food_requests
        SET pantry_id = ${pantryId}
        WHERE request_id = 1;
      `);
      await expect(
        service.create(
          1,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          3,
        ),
      ).rejects.toThrow(
        new BadRequestException(`Pantry ${pantryId} is not approved`),
      );
    });

    it('throw BadRequestException if pantry is pending', async () => {
      const pantryId = 5;
      await testDataSource.query(`
        UPDATE food_requests
        SET pantry_id = ${pantryId}
        WHERE request_id = 1;
      `);
      await expect(
        service.create(
          1,
          validCreateOrderDto.manufacturerId,
          parsedAllocations,
          3,
        ),
      ).rejects.toThrow(
        new BadRequestException(`Pantry ${pantryId} is not approved`),
      );
    });
  });

  describe('getAllOrdersForVolunteer', () => {
    it('should return all orders across all pantries and assignees, with required actions for assigned orders', async () => {
      const volunteerId = 6;
      const result = await service.getAllOrdersForVolunteer(volunteerId);

      expect(result).toHaveLength(4);

      const assignedOrder = result.find((o) => o.assignee.id === volunteerId);
      expect(assignedOrder?.actionCompletion).toEqual({
        confirmDonationReceipt: false,
        notifyPantry: false,
      });

      const notAssignedOrder = result.find(
        (o) => o.assignee.id !== volunteerId,
      );
      expect(notAssignedOrder?.actionCompletion).toBeUndefined();
    });

    it('should map the rest of the data correctly', async () => {
      const volunteerId = 6;
      const result = await service.getAllOrdersForVolunteer(volunteerId);
      const firstOrder = result[0];

      expect(firstOrder.orderId).toBe(4);
      expect(firstOrder.status).toBe(OrderStatus.PENDING);
      expect(firstOrder).toHaveProperty('createdAt');
      expect(firstOrder).toHaveProperty('shippedAt');
      expect(firstOrder).toHaveProperty('deliveredAt');
      expect(firstOrder.pantryName).toBe('Community Food Pantry Downtown');
      expect(firstOrder.assignee.id).toBe(volunteerId);
    });
  });

  describe('completeVolunteerAction', () => {
    it('should successfully complete confirmDonationReceipt', async () => {
      const orderId = 2;
      const order = await service.findOne(orderId);
      expect(order.confirmDonationReceipt).toBe(false);
      await testDataSource.query(
        `UPDATE orders SET status = '${OrderStatus.SHIPPED}' WHERE order_id = ${orderId}`,
      );

      await service.completeVolunteerAction(
        orderId,
        VolunteerAction.CONFIRM_DONATION_RECEIPT,
      );

      const updatedOrder = await service.findOne(orderId);
      expect(updatedOrder.confirmDonationReceipt).toBe(true);
    });

    it('should successfully complete notifyPantry', async () => {
      const orderId = 3; // shipped order
      const order = await service.findOne(orderId);
      expect(order.notifyPantry).toBe(false);

      await service.completeVolunteerAction(
        orderId,
        VolunteerAction.NOTIFY_PANTRY,
      );

      const updatedOrder = await service.findOne(orderId);
      expect(updatedOrder.notifyPantry).toBe(true);
    });

    it('throws when order is non-existent', async () => {
      const orderId = 999;
      await expect(
        service.completeVolunteerAction(
          orderId,
          VolunteerAction.CONFIRM_DONATION_RECEIPT,
        ),
      ).rejects.toThrow(new NotFoundException(`Order ${orderId} not found`));
    });

    it('throws when order is not shipped', async () => {
      const orderId = 2;
      const order = await service.findOne(orderId);
      expect(order.status).not.toBe(OrderStatus.SHIPPED);
      await expect(
        service.completeVolunteerAction(
          orderId,
          VolunteerAction.CONFIRM_DONATION_RECEIPT,
        ),
      ).rejects.toThrow(
        new BadRequestException(
          `Action ${VolunteerAction.CONFIRM_DONATION_RECEIPT} can only be completed for shipped orders`,
        ),
      );
    });

    it('throws when action is already completed', async () => {
      const orderId = 2;
      const action = VolunteerAction.NOTIFY_PANTRY;
      await testDataSource.query(
        `UPDATE orders SET notify_pantry = true WHERE order_id = ${orderId}`,
      );
      await expect(
        service.completeVolunteerAction(orderId, action),
      ).rejects.toThrow(
        new BadRequestException(
          `Action ${action} already completed for Order ${orderId}`,
        ),
      );
    });
  });

  describe('bulkUpdateTrackingCostInfo', () => {
    async function insertMatchedDonation(): Promise<number> {
      const [{ donation_id }] = await testDataSource.query(`
        INSERT INTO donations (food_manufacturer_id, status, recurrence, recurrence_freq, next_donation_dates, occurrences_remaining)
        VALUES (
          (SELECT food_manufacturer_id FROM food_manufacturers LIMIT 1),
          'matched', 'none', NULL, NULL, NULL
        )
        RETURNING donation_id
      `);
      return donation_id;
    }

    async function insertDonationItem(donationId: number): Promise<number> {
      const [{ item_id }] = await testDataSource.query(
        `INSERT INTO donation_items (donation_id, item_name, quantity, reserved_quantity, food_type, food_rescue, details_confirmed)
         VALUES ($1, 'Test Item', 10, 10, 'Granola', false, false)
         RETURNING item_id`,
        [donationId],
      );
      return item_id;
    }

    async function insertAllocation(
      orderId: number,
      itemId: number,
    ): Promise<void> {
      await testDataSource.query(
        `INSERT INTO allocations (order_id, item_id, allocated_quantity) VALUES ($1, $2, 1)`,
        [orderId, itemId],
      );
    }

    async function createPendingOrder(): Promise<number> {
      const [{ order_id }] = await testDataSource.query(`
        INSERT INTO orders (request_id, food_manufacturer_id, status, assignee_id)
        VALUES (
          (SELECT request_id FROM food_requests LIMIT 1),
          (SELECT food_manufacturer_id FROM food_manufacturers LIMIT 1),
          'pending',
          (SELECT user_id FROM users LIMIT 1)
        )
        RETURNING order_id
      `);
      return order_id;
    }

    it('throws BadRequestException when neither tracking link nor shipping cost is provided', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      await expect(
        service.bulkUpdateTrackingCostInfo({
          donationId,
          orders: [{ orderId: 4 }],
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Order 4 must include at least a tracking link or shipping cost.',
        ),
      );
    });

    it('does not update orders or call dependent services when given an empty orders array', async () => {
      const donationId = await insertMatchedDonation();
      const checkAndFulfillSpy = jest.spyOn(
        donationService,
        'checkAndFulfillDonation',
      );

      const beforeOrder = await service.findOne(4);

      await service.bulkUpdateTrackingCostInfo({ donationId, orders: [] });

      expect(checkAndFulfillSpy).not.toHaveBeenCalled();

      const afterOrder = await service.findOne(4);
      expect(afterOrder.trackingLink).toEqual(beforeOrder.trackingLink);
      expect(afterOrder.shippingCost).toEqual(beforeOrder.shippingCost);
      expect(afterOrder.status).toEqual(beforeOrder.status);
    });

    it('throws BadRequestException and does not update or call dependent services when duplicate order ids are provided', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      const beforeOrder = await service.findOne(4);

      const duplicateEntry1 = { orderId: 4, shippingCost: 100.0 };
      const duplicateEntry2 = {
        orderId: 4,
        shippingCost: 99.0,
        trackingLink: 'https://example.com',
      };

      await expect(
        service.bulkUpdateTrackingCostInfo({
          donationId,
          orders: [duplicateEntry1, duplicateEntry2],
        }),
      ).rejects.toThrow(
        new BadRequestException('Cannot update duplicate entries for orders'),
      );

      const afterOrder = await service.findOne(4);
      expect(afterOrder.trackingLink).toEqual(beforeOrder.trackingLink);
      expect(afterOrder.shippingCost).toEqual(beforeOrder.shippingCost);
    });

    it('throws NotFoundException when donation does not exist', async () => {
      const dto: BulkUpdateTrackingCostDto = {
        donationId: 9999,
        orders: [{ orderId: 4, shippingCost: 5.0 }],
      };

      await expect(service.bulkUpdateTrackingCostInfo(dto)).rejects.toThrow(
        new NotFoundException('Donation 9999 not found'),
      );
    });

    it('throws NotFoundException when one order does not exist', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      const dto: BulkUpdateTrackingCostDto = {
        donationId,
        orders: [
          { orderId: 4, shippingCost: 5.0 },
          { orderId: 9999, trackingLink: 'https://tracking2.com' },
        ],
      };

      await expect(service.bulkUpdateTrackingCostInfo(dto)).rejects.toThrow(
        new NotFoundException('Order 9999 not found'),
      );

      const order4 = await service.findOne(4);
      expect(order4.shippingCost).toBeNull();
    });

    it('throws BadRequestException when one order is not pending', async () => {
      const donationId = await insertMatchedDonation();
      const itemId1 = await insertDonationItem(donationId);
      const itemId2 = await insertDonationItem(donationId);
      await insertAllocation(4, itemId1);
      await insertAllocation(2, itemId2);

      const dto: BulkUpdateTrackingCostDto = {
        donationId,
        orders: [
          { orderId: 4, shippingCost: 5.0 },
          { orderId: 2, trackingLink: 'https://tracking2.com' },
        ],
      };

      await expect(service.bulkUpdateTrackingCostInfo(dto)).rejects.toThrow(
        new BadRequestException(
          `Can only update tracking info for pending orders. Order 2 is ${OrderStatus.DELIVERED}`,
        ),
      );
    });

    it('throws BadRequestException when one order does not belong to the donation', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);
      const orderId2 = await createPendingOrder();
      // orderId2 has no allocation to donationId

      const dto: BulkUpdateTrackingCostDto = {
        donationId,
        orders: [
          { orderId: 4, shippingCost: 5.0 },
          { orderId: orderId2, trackingLink: 'https://tracking2.com' },
        ],
      };

      await expect(service.bulkUpdateTrackingCostInfo(dto)).rejects.toThrow(
        new BadRequestException(
          `Order ${orderId2} does not belong to donation ${donationId}`,
        ),
      );
    });

    it('updates both fields when tracking link and shipping cost are provided', async () => {
      const donationId = await insertMatchedDonation();
      const itemId1 = await insertDonationItem(donationId);
      const itemId2 = await insertDonationItem(donationId);
      const orderId2 = await createPendingOrder();
      await insertAllocation(4, itemId1);
      await insertAllocation(orderId2, itemId2);

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [
          {
            orderId: 4,
            trackingLink: 'https://tracking1.com',
            shippingCost: 5.0,
          },
          {
            orderId: orderId2,
            trackingLink: 'https://tracking2.com',
            shippingCost: 7.5,
          },
        ],
      });

      const after1 = await service.findOne(4);
      const after2 = await service.findOne(orderId2);
      expect(after1.trackingLink).toEqual('https://tracking1.com');
      expect(after1.shippingCost).toEqual(5.0);
      expect(after1.status).toEqual(OrderStatus.SHIPPED);
      expect(after1.shippedAt).toBeDefined();
      expect(after2.trackingLink).toEqual('https://tracking2.com');
      expect(after2.shippingCost).toEqual(7.5);
      expect(after2.status).toEqual(OrderStatus.SHIPPED);
      expect(after2.shippedAt).toBeDefined();
    });

    it('updates only tracking link when no shipping cost is provided, order stays PENDING', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [{ orderId: 4, trackingLink: 'https://tracking.com' }],
      });

      const after = await service.findOne(4);
      expect(after.trackingLink).toEqual('https://tracking.com');
      expect(after.shippingCost).toBeNull();
      expect(after.status).toEqual(OrderStatus.PENDING);
      expect(after.shippedAt).toBeNull();
    });

    it('updates only shipping cost when no tracking link is provided, order stays PENDING', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [{ orderId: 4, shippingCost: 12.5 }],
      });

      const after = await service.findOne(4);
      expect(after.trackingLink).toBeNull();
      expect(after.shippingCost).toEqual(12.5);
      expect(after.status).toEqual(OrderStatus.PENDING);
      expect(after.shippedAt).toBeNull();
    });

    it('sets order to SHIPPED when a second partial call completes both fields', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [{ orderId: 4, trackingLink: 'https://tracking.com' }],
      });
      expect((await service.findOne(4)).status).toEqual(OrderStatus.PENDING);

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [{ orderId: 4, shippingCost: 10.0 }],
      });

      const after = await service.findOne(4);
      expect(after.trackingLink).toEqual('https://tracking.com');
      expect(after.shippingCost).toEqual(10.0);
      expect(after.status).toEqual(OrderStatus.SHIPPED);
      expect(after.shippedAt).toBeDefined();
    });

    it('calls donationService.checkAndFulfillDonation after updating orders', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      const spy = jest.spyOn(donationService, 'checkAndFulfillDonation');

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [{ orderId: 4, shippingCost: 5.0 }],
      });

      expect(spy).toHaveBeenCalled();
    });

    it('sends trackingLinkAvailable email to pantry user for each updated order with a tracking link', async () => {
      const donationId = await insertMatchedDonation();
      const itemId1 = await insertDonationItem(donationId);
      const itemId2 = await insertDonationItem(donationId);
      const orderId2 = await createPendingOrder();
      await insertAllocation(4, itemId1);
      await insertAllocation(orderId2, itemId2);

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [
          {
            orderId: 4,
            trackingLink: 'https://tracking1.com',
            shippingCost: 5.0,
          },
          {
            orderId: orderId2,
            trackingLink: 'https://tracking2.com',
            shippingCost: 7.5,
          },
        ],
      });

      const updatedOrders = await testDataSource.getRepository(Order).find({
        where: { orderId: In([4, orderId2]) },
        relations: [
          'request',
          'request.pantry',
          'request.pantry.pantryUser',
          'foodManufacturer',
          'assignee',
        ],
      });

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(
        updatedOrders.length,
      );
      for (const order of updatedOrders) {
        const message = emailTemplates.trackingLinkAvailable({
          pantryName: order.request.pantry.pantryName,
          fmName: order.foodManufacturer.foodManufacturerName,
          trackingLink: order.trackingLink!,
          volunteerName: `${order.assignee.firstName} ${order.assignee.lastName}`,
          volunteerEmail: order.assignee.email,
        });

        expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
          toEmail: order.request.pantry.pantryUser.email,
          subject: message.subject,
          bodyHtml: message.bodyHTML,
        });
      }
    });

    it('does not send email for orders without a tracking link', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [{ orderId: 4, shippingCost: 5.0 }],
      });

      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('does not send email for orders that already had a tracking link when only shipping cost is updated', async () => {
      const donationId = await insertMatchedDonation();
      const itemId = await insertDonationItem(donationId);
      await insertAllocation(4, itemId);

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [{ orderId: 4, trackingLink: 'https://tracking.com' }],
      });
      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(1);
      mockEmailsService.sendEmails.mockClear();

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [{ orderId: 4, shippingCost: 5.0 }],
      });

      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('logs a warning when one email fails but still updates all orders without throwing', async () => {
      const donationId = await insertMatchedDonation();
      const itemId1 = await insertDonationItem(donationId);
      const itemId2 = await insertDonationItem(donationId);
      const orderId2 = await createPendingOrder();
      await insertAllocation(4, itemId1);
      await insertAllocation(orderId2, itemId2);

      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('Email failed'),
      );
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      await service.bulkUpdateTrackingCostInfo({
        donationId,
        orders: [
          {
            orderId: 4,
            trackingLink: 'https://tracking1.com',
            shippingCost: 5.0,
          },
          {
            orderId: orderId2,
            trackingLink: 'https://tracking2.com',
            shippingCost: 7.5,
          },
        ],
      });

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(2);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Automated tracking link email failed to send for order',
        ),
      );

      const after1 = await service.findOne(4);
      const after2 = await service.findOne(orderId2);
      expect(after1.trackingLink).toEqual('https://tracking1.com');
      expect(after1.shippingCost).toEqual(5.0);
      expect(after1.status).toEqual(OrderStatus.SHIPPED);
      expect(after2.trackingLink).toEqual('https://tracking2.com');
      expect(after2.shippingCost).toEqual(7.5);
      expect(after2.status).toEqual(OrderStatus.SHIPPED);

      warnSpy.mockRestore();
    });
  });

  describe('sendConfirmDeliveryReminders', () => {
    // Orders eligible for a reminder: shipped, approved pantry, and shipped at
    // least a week ago (matching the service query).
    const eligibleOrders = async (): Promise<Order[]> =>
      testDataSource
        .getRepository(Order)
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.request', 'request')
        .leftJoinAndSelect('request.pantry', 'pantry')
        .leftJoinAndSelect('pantry.pantryUser', 'pantryUser')
        .leftJoinAndSelect('order.assignee', 'assignee')
        .leftJoinAndSelect('order.foodManufacturer', 'foodManufacturer')
        .where('order.status = :status', { status: OrderStatus.SHIPPED })
        .andWhere('pantry.status = :pantryStatus', {
          pantryStatus: ApplicationStatus.APPROVED,
        })
        .andWhere("order.shippedAt <= NOW() - INTERVAL '7 days'")
        .getMany();

    const expectedMessageFor = (order: Order) =>
      emailTemplates.pantryConfirmDeliveryReminder({
        pantryName: order.request.pantry.pantryName,
        fmName: order.foodManufacturer.foodManufacturerName,
        confirmDeliveryLink: `${EMAIL_REDIRECT_URL}/pantry-order-management?orderId=${order.orderId}&action=confirm-delivery`,
        volunteerName: `${order.assignee.firstName} ${order.assignee.lastName}`,
        volunteerEmail: order.assignee.email,
      });

    it('logs a warning and sends no emails when there are no unconfirmed deliveries', async () => {
      await testDataSource.query(
        `UPDATE orders SET status = $1 WHERE status = $2`,
        [OrderStatus.DELIVERED, OrderStatus.SHIPPED],
      );
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      await service.sendConfirmDeliveryReminders();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'No pantries with unconfirmed deliveries, skipping email sending.',
        ),
      );
      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('sends one personalized reminder per unconfirmed order', async () => {
      const warnSpy = jest.spyOn(service['logger'], 'warn');
      const orders = await eligibleOrders();
      expect(orders.length).toBeGreaterThan(0);

      await service.sendConfirmDeliveryReminders();

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(orders.length);
      for (const order of orders) {
        const message = expectedMessageFor(order);
        expect(mockEmailsService.sendEmails).toHaveBeenCalledWith({
          toEmail: order.request.pantry.pantryUser.email,
          subject: message.subject,
          bodyHtml: message.bodyHTML,
        });
      }
      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('sends a separate reminder for each unconfirmed order, even within the same pantry', async () => {
      const orderRepo = testDataSource.getRepository(Order);
      const existingShippedOrder = await orderRepo.findOne({
        where: { status: OrderStatus.SHIPPED },
      });
      if (!existingShippedOrder)
        throw new Error('Missing existingShippedOrder test object');

      const before = (await eligibleOrders()).length;

      // Add a second shipped order to the same request (same pantry), shipped
      // long enough ago to be eligible.
      const secondOrder = orderRepo.create({
        requestId: existingShippedOrder.requestId,
        foodManufacturerId: existingShippedOrder.foodManufacturerId,
        assigneeId: existingShippedOrder.assigneeId,
        status: OrderStatus.SHIPPED,
        shippedAt: new Date('2024-02-03T08:00:00Z'),
      });
      await orderRepo.save(secondOrder);

      await service.sendConfirmDeliveryReminders();

      expect(mockEmailsService.sendEmails).toHaveBeenCalledTimes(before + 1);
    });

    it('does not send a reminder for an order shipped less than a week ago', async () => {
      const orderRepo = testDataSource.getRepository(Order);

      await testDataSource.query(
        `UPDATE orders SET status = $1 WHERE status = $2`,
        [OrderStatus.DELIVERED, OrderStatus.SHIPPED],
      );

      const template = await orderRepo.findOne({
        where: { status: OrderStatus.DELIVERED },
      });
      if (!template) throw new Error('Missing order template');

      const recentOrder = orderRepo.create({
        requestId: template.requestId,
        foodManufacturerId: template.foodManufacturerId,
        assigneeId: template.assigneeId,
        status: OrderStatus.SHIPPED,
        shippedAt: new Date(),
      });
      await orderRepo.save(recentOrder);

      await service.sendConfirmDeliveryReminders();

      expect(mockEmailsService.sendEmails).not.toHaveBeenCalled();
    });

    it('logs a warning and continues when sending a reminder fails', async () => {
      const warnSpy = jest.spyOn(service['logger'], 'warn');
      mockEmailsService.sendEmails.mockRejectedValueOnce(
        new Error('SES failure'),
      );

      await expect(
        service.sendConfirmDeliveryReminders(),
      ).resolves.toBeUndefined();

      expect(mockEmailsService.sendEmails).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send confirm delivery reminder to'),
      );

      warnSpy.mockRestore();
    });
  });
});
