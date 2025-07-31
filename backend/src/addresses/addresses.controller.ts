import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  // JWT protected endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createAddressDto: CreateAddressDto, @Request() req: any) {
    return this.addressesService.create(createAddressDto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    return this.addressesService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.addressesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req: any,
  ) {
    return this.addressesService.update(id, updateAddressDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.addressesService.remove(id, req.user.userId);
  }

  // NextAuth endpoints (no JWT required)
  @Get('nextauth/:userId')
  async findAllForNextAuth(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.addressesService.findAll(userId);
  }

  @Post('nextauth')
  async createForNextAuth(@Body() body: CreateAddressDto & { userId: string }) {
    const { userId, ...createAddressDto } = body;
    
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    return this.addressesService.create(createAddressDto, userId);
  }

  @Patch('nextauth/:id')
  async updateForNextAuth(
    @Param('id') id: string,
    @Body() body: UpdateAddressDto & { userId: string },
  ) {
    const { userId, ...updateAddressDto } = body;
    
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    return this.addressesService.update(id, updateAddressDto, userId);
  }

  @Delete('nextauth/:id')
  async removeForNextAuth(@Param('id') id: string, @Body() body: { userId: string }) {
    const { userId } = body;
    
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    return this.addressesService.remove(id, userId);
  }
} 