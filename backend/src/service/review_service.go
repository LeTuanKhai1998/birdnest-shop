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

type ReviewService interface {
	GetProductReviews(productID string, page, limit int) ([]model.Review, int64, error)
	CreateReview(userID, productID string, rating int, comment *string) (*model.Review, error)
	UpdateReview(reviewID, userID string, rating int, comment *string) (*model.Review, error)
	DeleteReview(reviewID, userID string) error
	GetUserReviews(userID string, page, limit int) ([]model.Review, int64, error)
}

type reviewService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewReviewService(db *gorm.DB, validate *validator.Validate) ReviewService {
	return &reviewService{
		Log:      utils.Log,
		DB:       db,
		Validate: validate,
	}
}

func (s *reviewService) GetProductReviews(productID string, page, limit int) ([]model.Review, int64, error) {
	var reviews []model.Review
	var total int64

	offset := (page - 1) * limit
	query := s.DB.Preload("User").Where("product_id = ?", productID)

	// Count total
	if err := query.Model(&model.Review{}).Count(&total).Error; err != nil {
		s.Log.Errorf("Failed to count reviews: %+v", err)
		return nil, 0, err
	}

	// Get reviews with pagination
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&reviews).Error; err != nil {
		s.Log.Errorf("Failed to get reviews: %+v", err)
		return nil, 0, err
	}

	return reviews, total, nil
}

func (s *reviewService) CreateReview(userID, productID string, rating int, comment *string) (*model.Review, error) {
	// Validate rating
	if rating < 1 || rating > 5 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Rating must be between 1 and 5")
	}

	// Check if product exists
	var product model.Product
	if err := s.DB.First(&product, "id = ?", productID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Product not found")
		}
		return nil, err
	}

	// Check if user has already reviewed this product
	var existingReview model.Review
	err := s.DB.Where("user_id = ? AND product_id = ?", userID, productID).First(&existingReview).Error
	if err == nil {
		return nil, fiber.NewError(fiber.StatusConflict, "You have already reviewed this product")
	}

	// Check if user has purchased this product (optional validation)
	// This could be enhanced to check if user has purchased the product

	review := &model.Review{
		UserID:    userID,
		ProductID: productID,
		Rating:    rating,
		Comment:   comment,
	}

	if err := s.DB.Create(review).Error; err != nil {
		s.Log.Errorf("Failed to create review: %+v", err)
		return nil, err
	}

	// Preload user data for response
	if err := s.DB.Preload("User").First(review, "id = ?", review.ID).Error; err != nil {
		s.Log.Errorf("Failed to preload user data: %+v", err)
	}

	return review, nil
}

func (s *reviewService) UpdateReview(reviewID, userID string, rating int, comment *string) (*model.Review, error) {
	// Validate rating
	if rating < 1 || rating > 5 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Rating must be between 1 and 5")
	}

	var review model.Review
	if err := s.DB.Where("id = ? AND user_id = ?", reviewID, userID).First(&review).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Review not found")
		}
		return nil, err
	}

	review.Rating = rating
	review.Comment = comment

	if err := s.DB.Save(&review).Error; err != nil {
		s.Log.Errorf("Failed to update review: %+v", err)
		return nil, err
	}

	// Preload user data for response
	if err := s.DB.Preload("User").First(&review, "id = ?", review.ID).Error; err != nil {
		s.Log.Errorf("Failed to preload user data: %+v", err)
	}

	return &review, nil
}

func (s *reviewService) DeleteReview(reviewID, userID string) error {
	if err := s.DB.Where("id = ? AND user_id = ?", reviewID, userID).Delete(&model.Review{}).Error; err != nil {
		s.Log.Errorf("Failed to delete review: %+v", err)
		return err
	}

	return nil
}

func (s *reviewService) GetUserReviews(userID string, page, limit int) ([]model.Review, int64, error) {
	var reviews []model.Review
	var total int64

	offset := (page - 1) * limit
	query := s.DB.Preload("Product").Where("user_id = ?", userID)

	// Count total
	if err := query.Model(&model.Review{}).Count(&total).Error; err != nil {
		s.Log.Errorf("Failed to count user reviews: %+v", err)
		return nil, 0, err
	}

	// Get reviews with pagination
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&reviews).Error; err != nil {
		s.Log.Errorf("Failed to get user reviews: %+v", err)
		return nil, 0, err
	}

	return reviews, total, nil
}
