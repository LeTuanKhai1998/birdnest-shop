package service

import (
	"app/src/model"
	"app/src/utils"
	"fmt"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type DashboardService interface {
	GetDashboardMetrics() (*DashboardMetrics, error)
	GetRevenueChart(period string, days int) ([]ChartData, error)
	GetOrderStatistics(period string, days int) (*OrderStatistics, error)
	GetTopProducts(limit int) ([]TopProduct, error)
	GetLowStockProducts(threshold int) ([]model.Product, error)
	GetCustomerInsights() (*CustomerInsights, error)
	GetTopCustomers(limit int) ([]TopCustomer, error)
}

type DashboardMetrics struct {
	TotalRevenue      float64 `json:"totalRevenue"`
	TotalOrders       int64   `json:"totalOrders"`
	TotalCustomers    int64   `json:"totalCustomers"`
	AverageOrderValue float64 `json:"averageOrderValue"`
	RevenueTrend      float64 `json:"revenueTrend"`
	OrdersTrend       float64 `json:"ordersTrend"`
	CustomersTrend    float64 `json:"customersTrend"`
	AOVTrend          float64 `json:"aovTrend"`
}

type ChartData struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
	Orders  int     `json:"orders"`
}

type OrderStatistics struct {
	TotalOrders        int64          `json:"totalOrders"`
	StatusDistribution map[string]int `json:"statusDistribution"`
	PeriodData         []ChartData    `json:"periodData"`
}

type TopProduct struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Image     string  `json:"image"`
	UnitsSold int     `json:"unitsSold"`
	Revenue   float64 `json:"revenue"`
	Stock     int     `json:"stock"`
}

type CustomerInsights struct {
	NewCustomers       int64   `json:"newCustomers"`
	ReturningCustomers int64   `json:"returningCustomers"`
	TotalCustomers     int64   `json:"totalCustomers"`
	CustomerGrowth     float64 `json:"customerGrowth"`
}

type TopCustomer struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Email   string  `json:"email"`
	Revenue float64 `json:"revenue"`
	Orders  int     `json:"orders"`
}

type dashboardService struct {
	Log      *logrus.Logger
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewDashboardService(db *gorm.DB, validate *validator.Validate) DashboardService {
	return &dashboardService{
		Log:      utils.Log,
		DB:       db,
		Validate: validate,
	}
}

func (s *dashboardService) GetDashboardMetrics() (*DashboardMetrics, error) {
	var metrics DashboardMetrics

	// Get current period metrics
	var currentRevenue float64
	var currentOrders int64
	var currentCustomers int64

	// Total revenue
	if err := s.DB.Model(&model.Order{}).Where("status IN ?", []model.OrderStatus{model.OrderStatusPaid, model.OrderStatusShipped, model.OrderStatusDelivered}).Select("COALESCE(SUM(total), 0)").Scan(&currentRevenue).Error; err != nil {
		s.Log.Errorf("Failed to get current revenue: %+v", err)
		return nil, err
	}

	// Total orders
	if err := s.DB.Model(&model.Order{}).Count(&currentOrders).Error; err != nil {
		s.Log.Errorf("Failed to get current orders: %+v", err)
		return nil, err
	}

	// Total customers
	if err := s.DB.Model(&model.User{}).Where("is_admin = ?", false).Count(&currentCustomers).Error; err != nil {
		s.Log.Errorf("Failed to get current customers: %+v", err)
		return nil, err
	}

	// Calculate average order value
	if currentOrders > 0 {
		metrics.AverageOrderValue = currentRevenue / float64(currentOrders)
	}

	// Get previous period metrics for trends
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	var previousRevenue float64
	var previousOrders int64
	var previousCustomers int64

	// Previous period revenue
	if err := s.DB.Model(&model.Order{}).Where("status IN ? AND created_at >= ?", []model.OrderStatus{model.OrderStatusPaid, model.OrderStatusShipped, model.OrderStatusDelivered}, thirtyDaysAgo).Select("COALESCE(SUM(total), 0)").Scan(&previousRevenue).Error; err != nil {
		s.Log.Errorf("Failed to get previous revenue: %+v", err)
		return nil, err
	}

	// Previous period orders
	if err := s.DB.Model(&model.Order{}).Where("created_at >= ?", thirtyDaysAgo).Count(&previousOrders).Error; err != nil {
		s.Log.Errorf("Failed to get previous orders: %+v", err)
		return nil, err
	}

	// Previous period customers
	if err := s.DB.Model(&model.User{}).Where("is_admin = ? AND created_at >= ?", false, thirtyDaysAgo).Count(&previousCustomers).Error; err != nil {
		s.Log.Errorf("Failed to get previous customers: %+v", err)
		return nil, err
	}

	// Calculate trends
	metrics.TotalRevenue = currentRevenue
	metrics.TotalOrders = currentOrders
	metrics.TotalCustomers = currentCustomers

	if previousRevenue > 0 {
		metrics.RevenueTrend = ((currentRevenue - previousRevenue) / previousRevenue) * 100
	}
	if previousOrders > 0 {
		metrics.OrdersTrend = float64(currentOrders-previousOrders) / float64(previousOrders) * 100
	}
	if previousCustomers > 0 {
		metrics.CustomersTrend = float64(currentCustomers-previousCustomers) / float64(previousCustomers) * 100
	}

	// Calculate AOV trend
	var previousAOV float64
	if previousOrders > 0 {
		previousAOV = previousRevenue / float64(previousOrders)
	}
	if previousAOV > 0 {
		metrics.AOVTrend = ((metrics.AverageOrderValue - previousAOV) / previousAOV) * 100
	}

	return &metrics, nil
}

func (s *dashboardService) GetRevenueChart(period string, days int) ([]ChartData, error) {
	var chartData []ChartData
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	query := s.DB.Model(&model.Order{}).
		Where("status IN ? AND created_at BETWEEN ? AND ?",
			[]model.OrderStatus{model.OrderStatusPaid, model.OrderStatusShipped, model.OrderStatusDelivered},
			startDate, endDate)

	var results []struct {
		Date    string  `json:"date"`
		Revenue float64 `json:"revenue"`
		Orders  int     `json:"orders"`
	}

	// Group by date based on period
	var groupBy string
	switch period {
	case "daily":
		groupBy = "DATE(created_at)"
	case "weekly":
		groupBy = "DATE_TRUNC('week', created_at)"
	case "monthly":
		groupBy = "DATE_TRUNC('month', created_at)"
	case "yearly":
		groupBy = "DATE_TRUNC('year', created_at)"
	default:
		groupBy = "DATE(created_at)"
	}

	if err := query.Select(fmt.Sprintf("%s as date, COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders", groupBy)).
		Group(groupBy).
		Order("date ASC").
		Find(&results).Error; err != nil {
		s.Log.Errorf("Failed to get revenue chart data: %+v", err)
		return nil, err
	}

	for _, result := range results {
		chartData = append(chartData, ChartData{
			Date:    result.Date,
			Revenue: result.Revenue,
			Orders:  result.Orders,
		})
	}

	return chartData, nil
}

func (s *dashboardService) GetOrderStatistics(period string, days int) (*OrderStatistics, error) {
	var stats OrderStatistics
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	// Get total orders in period
	if err := s.DB.Model(&model.Order{}).Where("created_at BETWEEN ? AND ?", startDate, endDate).Count(&stats.TotalOrders).Error; err != nil {
		s.Log.Errorf("Failed to get total orders: %+v", err)
		return nil, err
	}

	// Get status distribution
	var statusResults []struct {
		Status string `json:"status"`
		Count  int    `json:"count"`
	}

	if err := s.DB.Model(&model.Order{}).
		Where("created_at BETWEEN ? AND ?", startDate, endDate).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&statusResults).Error; err != nil {
		s.Log.Errorf("Failed to get status distribution: %+v", err)
		return nil, err
	}

	stats.StatusDistribution = make(map[string]int)
	for _, result := range statusResults {
		stats.StatusDistribution[result.Status] = result.Count
	}

	// Get period data
	periodData, err := s.GetRevenueChart(period, days)
	if err != nil {
		return nil, err
	}
	stats.PeriodData = periodData

	return &stats, nil
}

func (s *dashboardService) GetTopProducts(limit int) ([]TopProduct, error) {
	var topProducts []TopProduct

	query := `
		SELECT 
			p.id,
			p.name,
			COALESCE(p.images[1], '') as image,
			COALESCE(SUM(oi.quantity), 0) as units_sold,
			COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
			p.quantity as stock
		FROM products p
		LEFT JOIN order_items oi ON p.id = oi.product_id
		LEFT JOIN orders o ON oi.order_id = o.id
		WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') OR o.id IS NULL
		GROUP BY p.id, p.name, p.quantity
		ORDER BY units_sold DESC
		LIMIT ?
	`

	if err := s.DB.Raw(query, limit).Scan(&topProducts).Error; err != nil {
		s.Log.Errorf("Failed to get top products: %+v", err)
		return nil, err
	}

	return topProducts, nil
}

func (s *dashboardService) GetLowStockProducts(threshold int) ([]model.Product, error) {
	var products []model.Product

	if err := s.DB.Preload("Category").Preload("Images").
		Where("quantity <= ?", threshold).
		Order("quantity ASC").
		Find(&products).Error; err != nil {
		s.Log.Errorf("Failed to get low stock products: %+v", err)
		return nil, err
	}

	return products, nil
}

func (s *dashboardService) GetCustomerInsights() (*CustomerInsights, error) {
	var insights CustomerInsights

	// Get total customers
	if err := s.DB.Model(&model.User{}).Where("is_admin = ?", false).Count(&insights.TotalCustomers).Error; err != nil {
		s.Log.Errorf("Failed to get total customers: %+v", err)
		return nil, err
	}

	// Get new customers (last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	if err := s.DB.Model(&model.User{}).Where("is_admin = ? AND created_at >= ?", false, thirtyDaysAgo).Count(&insights.NewCustomers).Error; err != nil {
		s.Log.Errorf("Failed to get new customers: %+v", err)
		return nil, err
	}

	// Get returning customers (customers with more than one order)
	var returningCustomers int64
	if err := s.DB.Model(&model.User{}).
		Joins("JOIN orders ON users.id = orders.user_id").
		Where("users.is_admin = ?", false).
		Group("users.id").
		Having("COUNT(orders.id) > 1").
		Count(&returningCustomers).Error; err != nil {
		s.Log.Errorf("Failed to get returning customers: %+v", err)
		return nil, err
	}
	insights.ReturningCustomers = returningCustomers

	// Calculate customer growth
	if insights.TotalCustomers > 0 {
		insights.CustomerGrowth = float64(insights.NewCustomers) / float64(insights.TotalCustomers) * 100
	}

	return &insights, nil
}

func (s *dashboardService) GetTopCustomers(limit int) ([]TopCustomer, error) {
	var topCustomers []TopCustomer

	query := `
		SELECT 
			u.id,
			u.name,
			u.email,
			COALESCE(SUM(o.total), 0) as revenue,
			COUNT(o.id) as orders
		FROM users u
		LEFT JOIN orders o ON u.id = o.user_id
		WHERE u.is_admin = false AND (o.status IN ('PAID', 'SHIPPED', 'DELIVERED') OR o.id IS NULL)
		GROUP BY u.id, u.name, u.email
		ORDER BY revenue DESC
		LIMIT ?
	`

	if err := s.DB.Raw(query, limit).Scan(&topCustomers).Error; err != nil {
		s.Log.Errorf("Failed to get top customers: %+v", err)
		return nil, err
	}

	return topCustomers, nil
}
