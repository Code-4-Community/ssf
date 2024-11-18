import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PantryRequest } from './pantryRequest.entity';
import { Pantry } from '../pantries/pantry.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('pantry-requests')
@Injectable()
export class PantryReqsService {
  constructor(
    @InjectRepository(PantryRequest)
    private pantryReqRepo: Repository<PantryRequest>,
    @InjectRepository(Pantry) private pantryRepo: Repository<Pantry>,
  ) {}

  @ApiOperation({ summary: 'Find a pantry request by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found pantry request',
    type: PantryRequest,
  })
  @ApiResponse({ status: 404, description: 'Pantry request not found' })
  async findOne(id: number): Promise<PantryRequest> {
    if (!id) {
      return null;
    }
    return this.pantryReqRepo.findOneBy({ id });
  }

  @ApiOperation({ summary: 'Approve a pantry request' })
  @ApiResponse({
    status: 200,
    description: 'The approved pantry',
    type: Pantry,
  })
  @ApiResponse({ status: 404, description: 'Pantry request not found' })
  async approve(id: number, ssf_representative_id: number): Promise<Pantry> {
    if (!id) {
      return null;
    }
    const pantryReq = await this.pantryReqRepo.findOneBy({ id });
    if (!pantryReq) {
      return null;
    }
    const pantry = new Pantry();
    pantry.name = pantryReq.name;
    pantry.address = pantryReq.address; // Assuming address is the location
    pantry.ssf_representative_id = ssf_representative_id;
    pantry.pantry_representative_id = pantryReq.pantry_representative_id;
    // Add other fields as necessary

    await this.pantryRepo.save(pantry);
    await this.pantryReqRepo.remove(pantryReq);

    return pantry;
  }
}
