import { PartialType } from '@nestjs/mapped-types';
import { CreateDonationDto } from './create-donation.dto';

export class UpdateDonationDto extends PartialType(CreateDonationDto) {}
