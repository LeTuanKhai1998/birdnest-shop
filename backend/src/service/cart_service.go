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

type CartService interface {
	GetCartItems(userID string) ([]model.CartItem, error)
	AddToCart(userID, productID string, quantity int) (*model.CartItem, error)
	UpdateCartItem(cartItemID, userID string, quantity int) (*model.CartItem, error)
	RemoveFromCart(cartItemID, userID string) error
	ClearCart(userID string) error
}

type cartService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewCartService(db *gorm.DB, validate *validator.Validate) CartService {
	return &cartService{
		Log:      utils.Log,
		DB:       db,
		Validate: validate,
	}
}

func (s *cartService) GetCartItems(userID string) ([]model.CartItem, error) {
	var cartItems []model.CartItem

	if err := s.DB.Preload("Product").Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
		s.Log.Errorf("Failed to get cart items: %+v", err)
		return nil, err
	}

	return cartItems, nil
}

func (s *cartService) AddToCart(userID, productID string, quantity int) (*model.CartItem, error) {
	// Check if product exists and has enough stock
	var product model.Product
	if err := s.DB.First(&product, "id = ?", productID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Product not found")
		}
		return nil, err
	}

	if product.Quantity < quantity {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Insufficient stock")
	}

	// Check if item already exists in cart
	var existingCartItem model.CartItem
	err := s.DB.Where("user_id = ? AND product_id = ?", userID, productID).First(&existingCartItem).Error

	if err == nil {
		// Update existing cart item
		existingCartItem.Quantity += quantity
		if err := s.DB.Save(&existingCartItem).Error; err != nil {
			s.Log.Errorf("Failed to update cart item: %+v", err)
			return nil, err
		}
		return &existingCartItem, nil
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new cart item
		cartItem := &model.CartItem{
			UserID:    userID,
			ProductID: productID,
			Quantity:  quantity,
		}

		if err := s.DB.Create(cartItem).Error; err != nil {
			s.Log.Errorf("Failed to create cart item: %+v", err)
			return nil, err
		}

		return cartItem, nil
	}

	return nil, err
}

func (s *cartService) UpdateCartItem(cartItemID, userID string, quantity int) (*model.CartItem, error) {
	var cartItem model.CartItem

	if err := s.DB.Where("id = ? AND user_id = ?", cartItemID, userID).First(&cartItem).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Cart item not found")
		}
		return nil, err
	}

	// Check if product has enough stock
	var product model.Product
	if err := s.DB.First(&product, "id = ?", cartItem.ProductID).Error; err != nil {
		return nil, err
	}

	if product.Quantity < quantity {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Insufficient stock")
	}

	cartItem.Quantity = quantity

	if err := s.DB.Save(&cartItem).Error; err != nil {
		s.Log.Errorf("Failed to update cart item: %+v", err)
		return nil, err
	}

	return &cartItem, nil
}

func (s *cartService) RemoveFromCart(cartItemID, userID string) error {
	if err := s.DB.Where("id = ? AND user_id = ?", cartItemID, userID).Delete(&model.CartItem{}).Error; err != nil {
		s.Log.Errorf("Failed to remove cart item: %+v", err)
		return err
	}

	return nil
}

func (s *cartService) ClearCart(userID string) error {
	if err := s.DB.Where("user_id = ?", userID).Delete(&model.CartItem{}).Error; err != nil {
		s.Log.Errorf("Failed to clear cart: %+v", err)
		return err
	}

	return nil
}
