package service

import (
	"app/src/model"
	"app/src/utils"
	"errors"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type OrderService interface {
	CreateOrder(userID string, items []model.OrderItem, shippingAddress string, paymentMethod model.PaymentMethod) (*model.Order, error)
	GetOrders(userID string, isAdmin bool, page, limit int, status string) ([]model.Order, int64, error)
	GetOrderByID(orderID, userID string, isAdmin bool) (*model.Order, error)
	UpdateOrderStatus(orderID string, status model.OrderStatus) (*model.Order, error)
	DeleteOrder(orderID string) error
	GetOrderStats(period string) (map[string]interface{}, error)
}

type orderService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewOrderService(db *gorm.DB, validate *validator.Validate) OrderService {
	return &orderService{
		Log:      utils.Log,
		DB:       db,
		Validate: validate,
	}
}

func (s *orderService) CreateOrder(userID string, items []model.OrderItem, shippingAddress string, paymentMethod model.PaymentMethod) (*model.Order, error) {
	// Calculate total
	var total float64
	for _, item := range items {
		// Get product price
		var product model.Product
		if err := s.DB.First(&product, "id = ?", item.ProductID).Error; err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Invalid product ID")
		}

		// Check stock
		if product.Quantity < item.Quantity {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Insufficient stock for product: "+product.Name)
		}

		item.Price = product.Price
		total += product.Price * float64(item.Quantity)

		// Update stock
		if err := s.DB.Model(&product).Update("quantity", product.Quantity-item.Quantity).Error; err != nil {
			return nil, err
		}
	}

	// Create order
	order := &model.Order{
		UserID:          userID,
		Total:           total,
		Status:          model.OrderStatusPending,
		PaymentMethod:   paymentMethod,
		ShippingAddress: shippingAddress,
		OrderItems:      items,
	}

	if err := s.DB.Create(order).Error; err != nil {
		s.Log.Errorf("Failed to create order: %+v", err)
		return nil, err
	}

	// Create order items
	for i := range items {
		items[i].OrderID = order.ID
		if err := s.DB.Create(&items[i]).Error; err != nil {
			s.Log.Errorf("Failed to create order item: %+v", err)
			return nil, err
		}
	}

	return order, nil
}

func (s *orderService) GetOrders(userID string, isAdmin bool, page, limit int, status string) ([]model.Order, int64, error) {
	var orders []model.Order
	var total int64

	offset := (page - 1) * limit
	query := s.DB.Preload("User").Preload("OrderItems.Product")

	// Filter by user if not admin
	if !isAdmin {
		query = query.Where("user_id = ?", userID)
	}

	// Filter by status if provided
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Count total
	if err := query.Model(&model.Order{}).Count(&total).Error; err != nil {
		s.Log.Errorf("Failed to count orders: %+v", err)
		return nil, 0, err
	}

	// Get orders with pagination
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&orders).Error; err != nil {
		s.Log.Errorf("Failed to get orders: %+v", err)
		return nil, 0, err
	}

	return orders, total, nil
}

func (s *orderService) GetOrderByID(orderID, userID string, isAdmin bool) (*model.Order, error) {
	var order model.Order

	query := s.DB.Preload("User").Preload("OrderItems.Product").Where("id = ?", orderID)

	// Filter by user if not admin
	if !isAdmin {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Order not found")
		}
		s.Log.Errorf("Failed to get order by ID: %+v", err)
		return nil, err
	}

	return &order, nil
}

func (s *orderService) UpdateOrderStatus(orderID string, status model.OrderStatus) (*model.Order, error) {
	var order model.Order

	if err := s.DB.First(&order, "id = ?", orderID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Order not found")
		}
		return nil, err
	}

	order.Status = status
	order.UpdatedAt = time.Now()

	if err := s.DB.Save(&order).Error; err != nil {
		s.Log.Errorf("Failed to update order status: %+v", err)
		return nil, err
	}

	return &order, nil
}

func (s *orderService) DeleteOrder(orderID string) error {
	if err := s.DB.Delete(&model.Order{}, "id = ?", orderID).Error; err != nil {
		s.Log.Errorf("Failed to delete order: %+v", err)
		return err
	}

	return nil
}

func (s *orderService) GetOrderStats(period string) (map[string]interface{}, error) {
	var stats map[string]interface{}

	// Get total orders
	var totalOrders int64
	if err := s.DB.Model(&model.Order{}).Count(&totalOrders).Error; err != nil {
		return nil, err
	}

	// Get total revenue
	var totalRevenue float64
	if err := s.DB.Model(&model.Order{}).Select("COALESCE(SUM(total), 0)").Scan(&totalRevenue).Error; err != nil {
		return nil, err
	}

	// Get orders by status
	var statusStats []struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	if err := s.DB.Model(&model.Order{}).Select("status, COUNT(*) as count").Group("status").Scan(&statusStats).Error; err != nil {
		return nil, err
	}

	stats = map[string]interface{}{
		"totalOrders":  totalOrders,
		"totalRevenue": totalRevenue,
		"statusStats":  statusStats,
	}

	return stats, nil
}
