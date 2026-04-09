import { IsEnum } from 'class-validator';
import { VolunteerAction } from '../types';

export class CompleteVolunteerActionDto {
  @IsEnum(VolunteerAction)
  action!: VolunteerAction;
}
