import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodManufacturer } from './manufacturers.entity';
import { Repository } from 'typeorm';
import { validateId } from '../utils/validation.utils';
import { FoodManufacturerApplicationDto } from './dtos/manufacturer-application.dto';
import { User } from '../users/user.entity';
import { Role } from '../users/types';
import { ApplicationStatus } from '../shared/types';
import { userSchemaDto } from '../users/dtos/userSchema.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class FoodManufacturersService {
  constructor(
    @InjectRepository(FoodManufacturer)
    private repo: Repository<FoodManufacturer>,

    private usersService: UsersService,
  ) {}

  async findOne(foodManufacturerId: number): Promise<FoodManufacturer> {
    validateId(foodManufacturerId, 'Food Manufacturer');

    const foodManufacturer = await this.repo.findOne({
      where: { foodManufacturerId },
    });

    if (!foodManufacturer) {
      throw new NotFoundException(
        `Food Manufacturer ${foodManufacturerId} not found`,
      );
    }
    return foodManufacturer;
  }

  async getPendingManufacturers(): Promise<FoodManufacturer[]> {
    return await this.repo.find({
      where: { status: ApplicationStatus.PENDING },
      relations: ['foodManufacturerRepresentative'],
    });
  }

  async addFoodManufacturer(
    foodManufacturerData: FoodManufacturerApplicationDto,
  ) {
    const foodManufacturerContact: User = new User();
    const foodManufacturer: FoodManufacturer = new FoodManufacturer();

    // primary contact information
    foodManufacturerContact.role = Role.FOODMANUFACTURER;
    foodManufacturerContact.firstName = foodManufacturerData.contactFirstName;
    foodManufacturerContact.lastName = foodManufacturerData.contactLastName;
    foodManufacturerContact.email = foodManufacturerData.contactEmail;
    foodManufacturerContact.phone = foodManufacturerData.contactPhone;

    foodManufacturer.foodManufacturerRepresentative = foodManufacturerContact;

    // secondary contact information
    foodManufacturer.secondaryContactFirstName =
      foodManufacturerData.secondaryContactFirstName;
    foodManufacturer.secondaryContactLastName =
      foodManufacturerData.secondaryContactLastName;
    foodManufacturer.secondaryContactEmail =
      foodManufacturerData.secondaryContactEmail;
    foodManufacturer.secondaryContactPhone =
      foodManufacturerData.secondaryContactPhone;

    // food manufacturer details information
    foodManufacturer.foodManufacturerName =
      foodManufacturerData.foodManufacturerName;
    foodManufacturer.foodManufacturerWebsite =
      foodManufacturerData.foodManufacturerWebsite;
    foodManufacturer.unlistedProductAllergens =
      foodManufacturerData.unlistedProductAllergens;
    foodManufacturer.facilityFreeAllergens =
      foodManufacturerData.facilityFreeAllergens;
    foodManufacturer.productsGlutenFree =
      foodManufacturerData.productsGlutenFree;
    foodManufacturer.productsContainSulfites =
      foodManufacturerData.productsContainSulfites;
    foodManufacturer.productsSustainableExplanation =
      foodManufacturerData.productsSustainableExplanation;
    foodManufacturer.inKindDonations = foodManufacturerData.inKindDonations;
    foodManufacturer.donateWastedFood = foodManufacturerData.donateWastedFood;
    foodManufacturer.manufacturerAttribute =
      foodManufacturerData.manufacturerAttribute;
    foodManufacturer.additionalComments =
      foodManufacturerData.additionalComments;
    foodManufacturer.newsletterSubscription =
      foodManufacturerData.newsletterSubscription;

    await this.repo.save(foodManufacturer);
  }

  async approve(id: number) {
    validateId(id, 'Food Manufacturer');

    const foodManufacturer = await this.repo.findOne({
      where: { foodManufacturerId: id },
    });
    if (!foodManufacturer) {
      throw new NotFoundException(`Food Manufacturer ${id} not found`);
    }

    const createUserDto: userSchemaDto = {
      email: foodManufacturer.foodManufacturerRepresentative.email,
      firstName: foodManufacturer.foodManufacturerRepresentative.firstName,
      lastName: foodManufacturer.foodManufacturerRepresentative.lastName,
      phone: foodManufacturer.foodManufacturerRepresentative.phone,
      role: Role.FOODMANUFACTURER,
    };

    const newFoodManufacturer = await this.usersService.create(createUserDto);

    await this.repo.update(id, {
      status: ApplicationStatus.APPROVED,
      foodManufacturerRepresentative: newFoodManufacturer,
    });
  }

  async deny(id: number) {
    validateId(id, 'Food Manufacturer');

    const foodManufacturer = await this.repo.findOne({
      where: { foodManufacturerId: id },
    });
    if (!foodManufacturer) {
      throw new NotFoundException(`Food Manufacturer ${id} not found`);
    }

    await this.repo.update(id, { status: ApplicationStatus.DENIED });
  }
}
