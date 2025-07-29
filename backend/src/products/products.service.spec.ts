import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../common/prisma.service';
import { Product, Category, Image, Prisma } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  };

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    price: new Prisma.Decimal('1000000'),
    discount: 0,
    quantity: 10,
    categoryId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory: Category = {
    id: '1',
    name: 'Test Category',
    slug: 'test-category',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockImage: Image = {
    id: '1',
    url: 'https://example.com/image.jpg',
    isPrimary: true,
    productId: '1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products without filters', async () => {
      const mockProducts = [
        { ...mockProduct, category: mockCategory, images: [mockImage] },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll({});

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: undefined,
        take: undefined,
        include: {
          category: true,
          images: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });
    });

    it('should return products with category filter', async () => {
      const mockProducts = [
        { ...mockProduct, category: mockCategory, images: [mockImage] },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll({ categoryId: '1' });

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { categoryId: '1' },
        skip: undefined,
        take: undefined,
        include: {
          category: true,
          images: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });
    });

    it('should return products with search filter', async () => {
      const mockProducts = [
        { ...mockProduct, category: mockCategory, images: [mockImage] },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll({ search: 'test' });

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: undefined,
        take: undefined,
        include: {
          category: true,
          images: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });
    });

    it('should return products with pagination', async () => {
      const mockProducts = [
        { ...mockProduct, category: mockCategory, images: [mockImage] },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          category: true,
          images: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProductWithDetails = {
        ...mockProduct,
        category: mockCategory,
        images: [mockImage],
        reviews: [],
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProductWithDetails);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProductWithDetails);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          category: true,
          images: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return null when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      const mockProductWithDetails = {
        ...mockProduct,
        category: mockCategory,
        images: [mockImage],
        reviews: [],
      };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProductWithDetails);

      const result = await service.findBySlug('test-product');

      expect(result).toEqual(mockProductWithDetails);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
        include: {
          category: true,
          images: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createData = {
        name: 'New Product',
        slug: 'new-product',
        description: 'New description',
        price: '2000000',
        quantity: 5,
        category: { connect: { id: '1' } },
      };

      const mockCreatedProduct = {
        ...mockProduct,
        ...createData,
        category: mockCategory,
        images: [],
      };
      mockPrismaService.product.create.mockResolvedValue(mockCreatedProduct);

      const result = await service.create(createData);

      expect(result).toEqual(mockCreatedProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          category: true,
          images: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: '3000000',
      };

      const mockUpdatedProduct = {
        ...mockProduct,
        ...updateData,
        category: mockCategory,
        images: [mockImage],
      };
      mockPrismaService.product.update.mockResolvedValue(mockUpdatedProduct);

      const result = await service.update('1', updateData);

      expect(result).toEqual(mockUpdatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        include: {
          category: true,
          images: true,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const mockDeletedProduct = {
        ...mockProduct,
        category: mockCategory,
        images: [mockImage],
      };
      mockPrismaService.product.delete.mockResolvedValue(mockDeletedProduct);

      const result = await service.delete('1');

      expect(result).toEqual(mockDeletedProduct);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [mockCategory];
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalled();
    });
  });
}); 