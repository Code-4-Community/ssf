import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { PantryReqsService } from './pantryRequests.service';
import { or404 } from '../utils';
import { Pantry } from '../pantries/pantry.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PantryRequest } from './pantryRequest.entity';

@ApiTags('pantry-requests')
@Controller('pantry_requests')
export class PantryReqsController {
  constructor(private pantryReqService: PantryReqsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Find a pantry request by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found pantry request',
    type: PantryRequest,
  })
  @ApiResponse({ status: 404, description: 'Pantry request not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PantryRequest> {
    return await or404(() => this.pantryReqService.findOne(id));
  }

  @Post('/approve/:pantryReqId')
  @ApiOperation({
    summary: 'Approves a pantry request and assigns a SSF rep to the pantry',
  })
  @ApiResponse({
    status: 200,
    description: 'The approved pantry',
    type: Pantry,
  })
  @ApiResponse({ status: 404, description: 'Pantry request not found' })
  async approvePantryReq(
    @Param('pantryReqId', ParseIntPipe) pantryReqId: number,
    @Body('ssf_representative_id', ParseIntPipe) ssf_representative_id: number,
  ): Promise<Pantry> {
    return await or404(() =>
      this.pantryReqService.approve(pantryReqId, ssf_representative_id),
    );
  }
}
