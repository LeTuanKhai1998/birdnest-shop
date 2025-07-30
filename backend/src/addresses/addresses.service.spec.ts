import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { PrismaService } from '../common/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Address } from '@prisma/client';

describe('AddressesService', () => {
  let service: AddressesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    address: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAddress: Address = {
    id: '1',
    userId: 'user-1',
    fullName: 'Test User',
    phone: '1234567890',
    address: '123 Test St',
    apartment: 'Apt 1',
    province: 'Test Province',
    district: 'Test District',
    ward: 'Test Ward',
    country: 'Vietnam',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new address', async () => {
      const createAddressDto = {
        fullName: 'Test User',
        phone: '1234567890',
        address: '123 Test St',
        apartment: 'Apt 1',
        province: 'Test Province',
        district: 'Test District',
        ward: 'Test Ward',
        country: 'Vietnam',
        isDefault: false,
      };

      mockPrismaService.address.create.mockResolvedValue(mockAddress);

      const result = await service.create(createAddressDto, 'user-1');

      expect(result).toEqual(mockAddress);
      expect(mockPrismaService.address.create).toHaveBeenCalledWith({
        data: {
          ...createAddressDto,
          userId: 'user-1',
        },
      });
    });

    it('should unset other default addresses when creating a new default address', async () => {
      const createAddressDto = {
        fullName: 'Test User',
        phone: '1234567890',
        address: '123 Test St',
        province: 'Test Province',
        district: 'Test District',
        ward: 'Test Ward',
        country: 'Vietnam',
        isDefault: true,
      };

      mockPrismaService.address.create.mockResolvedValue(mockAddress);

      await service.create(createAddressDto, 'user-1');

      expect(mockPrismaService.address.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isDefault: true },
        data: { isDefault: false },
      });
    });
  });

  describe('findAll', () => {
    it('should return all addresses for a user', async () => {
      const mockAddresses = [mockAddress];
      mockPrismaService.address.findMany.mockResolvedValue(mockAddresses);

      const result = await service.findAll('user-1');

      expect(result).toEqual(mockAddresses);
      expect(mockPrismaService.address.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    });
  });

  describe('findOne', () => {
    it('should return an address if it exists and belongs to the user', async () => {
      mockPrismaService.address.findUnique.mockResolvedValue(mockAddress);

      const result = await service.findOne('1', 'user-1');

      expect(result).toEqual(mockAddress);
      expect(mockPrismaService.address.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if address does not exist', async () => {
      mockPrismaService.address.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if address belongs to another user', async () => {
      mockPrismaService.address.findUnique.mockResolvedValue(mockAddress);

      await expect(service.findOne('1', 'user-2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update an address if it exists and belongs to the user', async () => {
      const updateAddressDto = {
        fullName: 'Updated User',
        phone: '0987654321',
      };

      mockPrismaService.address.findUnique.mockResolvedValue(mockAddress);
      mockPrismaService.address.update.mockResolvedValue({
        ...mockAddress,
        ...updateAddressDto,
      });

      const result = await service.update('1', updateAddressDto, 'user-1');

      expect(result).toEqual({
        ...mockAddress,
        ...updateAddressDto,
      });
      expect(mockPrismaService.address.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateAddressDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete an address if it exists and belongs to the user', async () => {
      mockPrismaService.address.findUnique.mockResolvedValue(mockAddress);
      mockPrismaService.address.delete.mockResolvedValue(mockAddress);

      const result = await service.remove('1', 'user-1');

      expect(result).toEqual(mockAddress);
      expect(mockPrismaService.address.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
}); 