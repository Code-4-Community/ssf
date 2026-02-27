import { IsPositive } from 'class-validator';

export class DeleteUserDto {
  @IsPositive()
  userId!: number;
}
