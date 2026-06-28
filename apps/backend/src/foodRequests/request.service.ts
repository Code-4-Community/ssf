import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRequest } from './request.entity';
import { validateId } from '../utils/validation.utils';
import { FoodRequestStatus, RequestSize } from './types';
import { FoodRequestSummaryDto } from './dtos/food-request-summary.dto';
import { Pantry } from '../pantries/pantries.entity';
import { Order } from '../orders/order.entity';
import { OrderDetailsDto } from '../orders/dtos/order-details.dto';
import { OrderStatus } from '../orders/types';
import { FoodManufacturer } from '../foodManufacturers/manufacturers.entity';
import {
  MatchingItemsDto,
  MatchingManufacturersDto,
} from './dtos/matching.dto';
import { FoodType } from '../donationItems/types';
import { DonationItem } from '../donationItems/donationItems.entity';
import { EmailsService } from '../emails/email.service';
import { emailTemplates } from '../emails/emailTemplates';
import { UpdateRequestDto } from './dtos/update-request.dto';
import { ApplicationStatus } from '../shared/types';
import { UsersService } from '../users/users.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(FoodRequest) private repo: Repository<FoodRequest>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(FoodManufacturer)
    private foodManufacturerRepo: Repository<FoodManufacturer>,
    @InjectRepository(DonationItem)
    private donationItemRepo: Repository<DonationItem>,
    private emailsService: EmailsService,
    private usersService: UsersService,
  ) {}

  async findOne(requestId: number): Promise<FoodRequest> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }
    return request;
  }

  async getAll(): Promise<FoodRequestSummaryDto[]> {
    return this.repo
      .createQueryBuilder('request')
      .leftJoin('request.pantry', 'pantry')
      .select([
        'request.requestId',
        'request.requestedSize',
        'request.requestedFoodTypes',
        'request.location',
        'request.additionalInformation',
        'request.feedbackOnPriorDonation',
        'request.requestedAt',
        'request.status',
        'pantry.pantryId',
        'pantry.pantryName',
      ])
      .getMany();
  }

  async getOrderDetails(requestId: number): Promise<OrderDetailsDto[]> {
    validateId(requestId, 'Request');

    const requestExists = await this.repo.findOne({
      where: { requestId },
    });

    if (!requestExists) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const orders = await this.orderRepo.find({
      where: { requestId },
      relations: {
        foodManufacturer: true,
        allocations: {
          item: true,
        },
      },
    });

    return orders.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      foodManufacturerName: order.foodManufacturer.foodManufacturerName,
      trackingLink: order.trackingLink,
      shippingCost: order.shippingCost,
      items: order.allocations.map((allocation) => ({
        id: allocation.item.itemId,
        name: allocation.item.itemName,
        quantity: allocation.allocatedQuantity,
        foodType: allocation.item.foodType,
      })),
    }));
  }

  async getMatchingManufacturers(
    requestId: number,
  ): Promise<MatchingManufacturersDto> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({ where: { requestId } });
    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const requestedFoodTypes = request.requestedFoodTypes;

    const rows: (FoodManufacturer & { matching: boolean })[] =
      await this.foodManufacturerRepo
        .createQueryBuilder('fm')
        .addSelect(
          `EXISTS (
          SELECT 1
          FROM donations d
          JOIN donation_items di ON d.donation_id = di.donation_id
          WHERE d.food_manufacturer_id = fm.food_manufacturer_id
            AND di.food_type = ANY(:requestedFoodTypes)
            AND di.reserved_quantity < di.quantity
        )`,
          'matching',
        )
        .where(
          `EXISTS (
          SELECT 1
          FROM donations d
          JOIN donation_items di ON d.donation_id = di.donation_id
          WHERE d.food_manufacturer_id = fm.food_manufacturer_id
            AND di.reserved_quantity < di.quantity
        )`,
          { requestedFoodTypes },
        )
        .andWhere('fm.status = :status', { status: 'approved' })
        .getRawAndEntities()
        .then(({ raw, entities }) =>
          entities.map((fm, i) => ({
            ...fm,
            matching: raw[i].matching as boolean,
          })),
        );

    const matchingManufacturers: typeof rows = [];
    const nonMatchingManufacturers: typeof rows = [];

    for (const fm of rows) {
      if (fm.matching) {
        matchingManufacturers.push(fm);
      } else {
        nonMatchingManufacturers.push(fm);
      }
    }

    return {
      matchingManufacturers,
      nonMatchingManufacturers,
    };
  }

  async getAvailableItems(
    requestId: number,
    foodManufacturerId: number,
  ): Promise<MatchingItemsDto> {
    validateId(requestId, 'Request');
    validateId(foodManufacturerId, 'Manufacturer');

    const request = await this.repo.findOne({ where: { requestId } });
    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const manufacturer = await this.foodManufacturerRepo.findOne({
      where: { foodManufacturerId },
    });

    if (!manufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${foodManufacturerId} not found`,
      );
    }

    if (manufacturer.status !== ApplicationStatus.APPROVED) {
      throw new ConflictException(
        `Food Manufacturer ${foodManufacturerId} not approved`,
      );
    }

    const availableItems = await this.donationItemRepo
      .createQueryBuilder('di')
      .select([
        'di.item_id AS "itemId"',
        'di.item_name AS "itemName"',
        'di.food_type AS "foodType"',
        '(di.quantity - di.reserved_quantity) AS "availableQuantity"',
      ])
      .innerJoin('di.donation', 'd')
      .where('d.food_manufacturer_id = :foodManufacturerId', {
        foodManufacturerId,
      })
      .andWhere('di.reserved_quantity < di.quantity')
      .getRawMany();

    const requestedFoodTypes = new Set(request.requestedFoodTypes);

    const matchingItems: typeof availableItems = [];
    const nonMatchingItems: typeof availableItems = [];

    for (const item of availableItems) {
      if (requestedFoodTypes.has(item.foodType)) {
        matchingItems.push(item);
      } else {
        nonMatchingItems.push(item);
      }
    }

    return { matchingItems, nonMatchingItems };
  }

  async create(
    pantryId: number,
    requestedSize: RequestSize,
    requestedFoodTypes: FoodType[],
    location: string,
    additionalInformation?: string,
    feedbackOnPriorDonation?: string,
  ): Promise<FoodRequest> {
    validateId(pantryId, 'Pantry');

    const pantry = await this.pantryRepo.findOne({
      where: { pantryId },
      relations: ['pantryUser', 'volunteers'],
    });

    if (!pantry) {
      throw new NotFoundException(`Pantry ${pantryId} not found`);
    }

    if (pantry.status !== ApplicationStatus.APPROVED) {
      throw new ConflictException(`Pantry ${pantryId} not approved`);
    }

    const foodRequest = this.repo.create({
      pantryId,
      requestedSize,
      requestedFoodTypes,
      location,
      additionalInformation,
      feedbackOnPriorDonation,
    });

    await this.repo.save(foodRequest);

    const volunteers = pantry.volunteers || [];
    const volunteerEmails = volunteers.map((v) => v.email);

    if (volunteerEmails.length === 0) {
      return foodRequest;
    }

    try {
      const message = emailTemplates.pantrySubmitsFoodRequest({
        pantryName: pantry.pantryName,
      });

      await this.emailsService.sendEmails({
        toEmail: pantry.pantryUser.email,
        subject: message.subject,
        bodyHtml: message.bodyHTML,
        bccEmails: volunteerEmails,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to send new food request notification email to volunteers',
      );
    }

    return foodRequest;
  }

  async findAllForPantry(pantryId: number): Promise<FoodRequestSummaryDto[]> {
    validateId(pantryId, 'Pantry');

    return this.repo.find({
      where: { pantryId },
      relations: ['pantry'],
    });
  }

  async updateRequestStatus(requestId: number): Promise<void> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders', 'pantry', 'pantry.pantryUser', 'pantry.volunteers'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    const orders = request.orders || [];

    if (!orders.length) {
      throw new BadRequestException(
        `Cannot update request ${requestId} with no orders`,
      );
    }

    if (request.status === FoodRequestStatus.CLOSED) {
      throw new BadRequestException(`Request ${requestId} is already closed`);
    }

    const allComplete = orders.every(
      (order) =>
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.CLOSED,
    );

    request.status = allComplete
      ? FoodRequestStatus.CLOSED
      : FoodRequestStatus.ACTIVE;

    await this.repo.save(request);

    if (allComplete) {
      try {
        const lastDeliveredOrder = await this.orderRepo.findOne({
          where: { requestId, status: OrderStatus.DELIVERED },
          order: { deliveredAt: 'DESC' },
          relations: ['assignee'],
        });

        if (lastDeliveredOrder) {
          const volunteers = request.pantry.volunteers || [];
          const volunteerEmails = volunteers.map((v) => v.email);

          const { assignee } = lastDeliveredOrder;
          const message = emailTemplates.pantryRequestClosed({
            pantryName: request.pantry.pantryName,
            volunteerName: `${assignee.firstName} ${assignee.lastName}`,
            volunteerEmail: assignee.email,
          });
          await this.emailsService.sendEmails({
            toEmail: request.pantry.pantryUser.email,
            subject: message.subject,
            bodyHtml: message.bodyHTML,
            bccEmails: volunteerEmails,
          });
        } else {
          throw new InternalServerErrorException(
            `Request ${requestId} auto-closed, but failed to send pantry notification email`,
          );
        }
      } catch {
        throw new InternalServerErrorException(
          `Request ${requestId} auto-closed, but failed to send pantry notification email`,
        );
      }
    }
  }

  async update(requestId: number, dto: UpdateRequestDto): Promise<void> {
    validateId(requestId, 'Request');

    if (
      dto.requestedSize == undefined &&
      dto.requestedFoodTypes == undefined &&
      dto.location == undefined &&
      dto.additionalInformation == undefined &&
      dto.feedbackOnPriorDonation == undefined
    ) {
      throw new BadRequestException(
        'At least one field must be provided to update request',
      );
    }

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    if (request.status != FoodRequestStatus.ACTIVE) {
      throw new BadRequestException(
        `Request must be ${FoodRequestStatus.ACTIVE} in order to be updated`,
      );
    }

    if (request.orders && request.orders.length > 0) {
      throw new BadRequestException(
        `Request ${requestId} cannot be updated if it still has orders associated with it`,
      );
    }

    Object.assign(request, dto);

    await this.repo.save(request);
  }

  async delete(requestId: number) {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['orders'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    if (request.status != FoodRequestStatus.ACTIVE) {
      throw new BadRequestException(
        `Request must be ${FoodRequestStatus.ACTIVE} in order to be deleted`,
      );
    }

    if (request.orders && request.orders.length > 0) {
      throw new BadRequestException(
        `Request ${requestId} cannot be deleted if it still has orders associated with it`,
      );
    }

    await this.repo.remove(request);
  }

  async closeRequest(
    requestId: number,
    actingUserId: number,
  ): Promise<FoodRequest> {
    validateId(requestId, 'Request');

    const request = await this.repo.findOne({
      where: { requestId },
      relations: ['pantry', 'pantry.pantryUser', 'pantry.volunteers'],
    });

    if (!request) {
      throw new NotFoundException(`Request ${requestId} not found`);
    }

    if (request.status !== FoodRequestStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot close a request with status: ${request.status}`,
      );
    }

    const assignee = await this.usersService.findOne(actingUserId);

    request.status = FoodRequestStatus.CLOSED;
    const saved = await this.repo.save(request);
    try {
      const volunteers = request.pantry.volunteers || [];
      const volunteerEmails = volunteers.map((v) => v.email);
      const message = emailTemplates.pantryRequestClosed({
        pantryName: request.pantry.pantryName,
        volunteerName: `${assignee.firstName} ${assignee.lastName}`,
        volunteerEmail: assignee.email,
      });
      await this.emailsService.sendEmails({
        toEmail: request.pantry.pantryUser.email,
        subject: message.subject,
        bodyHtml: message.bodyHTML,
        bccEmails: volunteerEmails,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to send food request closed email to pantry',
      );
    }

    return saved;
  }
}
