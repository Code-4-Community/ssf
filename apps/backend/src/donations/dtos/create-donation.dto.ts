import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
  ValidateNested,
  registerDecorator,
} from 'class-validator';
import { RecurrenceEnum } from '../types';
import { Type } from 'class-transformer';
import { FoodType } from '../../donationItems/types';

function AtLeastOneDaySelected() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneDaySelected',
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: Record<string, any>) {
          return !!value && Object.values(value).some((v) => v === true);
        },
        defaultMessage() {
          return 'At least one day must be selected for weekly recurrence';
        },
      },
    });
  };
}

export class RepeatOnDaysDto {
  @IsBoolean()
  @IsOptional()
  Monday?: boolean;

  @IsBoolean()
  @IsOptional()
  Tuesday?: boolean;

  @IsBoolean()
  @IsOptional()
  Wednesday?: boolean;

  @IsBoolean()
  @IsOptional()
  Thursday?: boolean;

  @IsBoolean()
  @IsOptional()
  Friday?: boolean;

  @IsBoolean()
  @IsOptional()
  Saturday?: boolean;

  @IsBoolean()
  @IsOptional()
  Sunday?: boolean;
}

export class CreateDonationItemDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  itemName!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'ozPerItem must have at most 2 decimal places' },
  )
  @Min(0.01)
  @IsOptional()
  ozPerItem?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'estimatedValue must have at most 2 decimal places' },
  )
  @Min(0.01)
  @IsOptional()
  estimatedValue?: number;

  @IsEnum(FoodType)
  foodType!: FoodType;

  @IsBoolean()
  foodRescue!: boolean;
}

export class CreateDonationDto {
  @IsInt()
  @Min(1)
  foodManufacturerId!: number;

  @IsNotEmpty()
  @IsEnum(RecurrenceEnum)
  recurrence!: RecurrenceEnum;

  @IsInt()
  @ValidateIf((o) => o.recurrence !== RecurrenceEnum.NONE)
  @Min(1)
  recurrenceFreq?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RepeatOnDaysDto)
  @AtLeastOneDaySelected()
  @ValidateIf((o) => o.recurrence === RecurrenceEnum.WEEKLY)
  repeatOnDays?: RepeatOnDaysDto;

  @IsInt()
  @ValidateIf((o) => o.recurrence !== RecurrenceEnum.NONE)
  @Min(1)
  occurrencesRemaining?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDonationItemDto)
  items!: CreateDonationItemDto[];
}
