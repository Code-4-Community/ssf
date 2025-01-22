import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryDto } from './DeliveryDTO';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('deliveries')
@UseInterceptors(
  FilesInterceptor('photoPaths', 3, {
    storage: diskStorage({
      destination: './uploads/deliveries',
      filename: (req, file, callback) => {
        const fileName = file.originalname;
        callback(null, fileName);
      },
    }),
  }),
)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('/food-requests/:request_id/confirm-delivery')
  async confirmDelivery(
    @Body() body: DeliveryDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const photoPaths = files.map((file) => file.path);

    const delivery = await this.deliveryService.confirmDelivery({
      deliveryDate: body.deliveryDate,
      feedback: body.feedback || null,
      photoPaths: photoPaths,
    });

    return delivery;
  }
}
