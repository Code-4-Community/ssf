export class ConfirmDeliveryDto {
  dateReceived: string;
  feedback?: string;
  photos?: Express.Multer.File[];
}
