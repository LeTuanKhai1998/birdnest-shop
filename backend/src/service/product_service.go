package service

import (
	"app/src/model"
	"app/src/utils"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ProductService interface {
	GetProducts(page, limit int, categoryID, search string, minPrice, maxPrice float64) ([]model.Product, int64, error)
	GetProductByID(id string) (*model.Product, error)
	CreateProduct(product *model.Product) (*model.Product, error)
	UpdateProduct(product *model.Product) (*model.Product, error)
	DeleteProduct(id string) error
	GetCategories() ([]model.Category, error)
	CreateCategory(category *model.Category) (*model.Category, error)
}

type productService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewProductService(db *gorm.DB, validate *validator.Validate) ProductService {
	return &productService{
		Log:      utils.Log,
		DB:       db,
		Validate: validate,
	}
}

func (s *productService) GetProducts(page, limit int, categoryID, search string, minPrice, maxPrice float64) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64

	offset := (page - 1) * limit
	query := s.DB.Preload("Category").Preload("Images")

	// Apply filters
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if minPrice > 0 {
		query = query.Where("price >= ?", minPrice)
	}

	if maxPrice > 0 {
		query = query.Where("price <= ?", maxPrice)
	}

	// Count total
	if err := query.Model(&model.Product{}).Count(&total).Error; err != nil {
		s.Log.Errorf("Failed to count products: %+v", err)
		return nil, 0, err
	}

	// Get products with pagination
	if err := query.Offset(offset).Limit(limit).Find(&products).Error; err != nil {
		s.Log.Errorf("Failed to get products: %+v", err)
		return nil, 0, err
	}

	return products, total, nil
}

func (s *productService) GetProductByID(id string) (*model.Product, error) {
	var product model.Product

	if err := s.DB.Preload("Category").Preload("Images").Preload("Reviews.User").First(&product, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Product not found")
		}
		s.Log.Errorf("Failed to get product by ID: %+v", err)
		return nil, err
	}

	return &product, nil
}

func (s *productService) CreateProduct(product *model.Product) (*model.Product, error) {
	if err := s.Validate.Struct(product); err != nil {
		return nil, err
	}

	if err := s.DB.Create(product).Error; err != nil {
		s.Log.Errorf("Failed to create product: %+v", err)
		return nil, err
	}

	return product, nil
}

func (s *productService) UpdateProduct(product *model.Product) (*model.Product, error) {
	if err := s.Validate.Struct(product); err != nil {
		return nil, err
	}

	if err := s.DB.Save(product).Error; err != nil {
		s.Log.Errorf("Failed to update product: %+v", err)
		return nil, err
	}

	return product, nil
}

func (s *productService) DeleteProduct(id string) error {
	if err := s.DB.Delete(&model.Product{}, "id = ?", id).Error; err != nil {
		s.Log.Errorf("Failed to delete product: %+v", err)
		return err
	}

	return nil
}

func (s *productService) GetCategories() ([]model.Category, error) {
	var categories []model.Category

	if err := s.DB.Find(&categories).Error; err != nil {
		s.Log.Errorf("Failed to get categories: %+v", err)
		return nil, err
	}

	return categories, nil
}

func (s *productService) CreateCategory(category *model.Category) (*model.Category, error) {
	if err := s.Validate.Struct(category); err != nil {
		return nil, err
	}

	if err := s.DB.Create(category).Error; err != nil {
		s.Log.Errorf("Failed to create category: %+v", err)
		return nil, err
	}

	return category, nil
}
