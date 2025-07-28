package router

import (
	"app/src/controller"
	"app/src/service"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func DashboardRoutes(app fiber.Router, db *gorm.DB, validate *validator.Validate) {
	dashboardService := service.NewDashboardService(db, validate)
	dashboardController := controller.NewDashboardController(dashboardService)

	// Dashboard metrics endpoints
	app.Get("/dashboard/metrics", dashboardController.GetDashboardMetrics)
	app.Get("/dashboard/revenue-chart", dashboardController.GetRevenueChart)
	app.Get("/dashboard/order-statistics", dashboardController.GetOrderStatistics)
	app.Get("/dashboard/top-products", dashboardController.GetTopProducts)
	app.Get("/dashboard/low-stock-products", dashboardController.GetLowStockProducts)
	app.Get("/dashboard/customer-insights", dashboardController.GetCustomerInsights)
	app.Get("/dashboard/top-customers", dashboardController.GetTopCustomers)
}
