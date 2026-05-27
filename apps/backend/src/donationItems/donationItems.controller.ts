import {
  Controller,
  Param,
  Get,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DonationItemsService } from './donationItems.service';
import { DonationItem } from './donationItems.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/types';
import {
  CheckOwnership,
  OwnerIdResolver,
  pipeNullable,
} from '../auth/ownership.decorator';
import { DonationService } from '../donations/donations.service';
import { Donation } from '../donations/donations.entity';

const resolveDonationAuthorizedUserIds: OwnerIdResolver = ({
  entityId,
  services,
}) =>
  pipeNullable(
    () => services.get(DonationService).findOne(entityId),
    (donation: Donation) => [
      donation.foodManufacturer.foodManufacturerRepresentative.id,
    ],
  );

@Controller('donation-items')
@UseGuards(AuthGuard('jwt'))
export class DonationItemsController {
  constructor(private donationItemsService: DonationItemsService) {}

  @CheckOwnership({
    idParam: 'donationId',
    resolver: resolveDonationAuthorizedUserIds,
    bypassRoles: [Role.ADMIN],
  })
  @Roles(Role.ADMIN, Role.FOODMANUFACTURER)
  @Get('/:donationId/all')
  async getAllDonationItemsForDonation(
    @Param('donationId', ParseIntPipe) donationId: number,
  ): Promise<DonationItem[]> {
    return this.donationItemsService.getAllDonationItems(donationId);
  }
}
