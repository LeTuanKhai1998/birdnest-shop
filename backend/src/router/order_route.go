package router

import (
	"app/src/controller"
	m "app/src/middleware"
	"app/src/service"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func OrderRoutes(router fiber.Router, db *gorm.DB, validate *validator.Validate, userService service.UserService) {
	orderService := service.NewOrderService(db, validate)
	orderController := controller.NewOrderController(orderService)

	// User routes (require authentication)
	userGroup := router.Group("/orders", m.Auth(userService))
	userGroup.Post("/", orderController.CreateOrder)
	userGroup.Get("/", orderController.GetOrders)
	userGroup.Get("/:id", orderController.GetOrder)

	// Admin routes (require authentication and admin privileges)
	adminGroup := router.Group("/admin/orders", m.Auth(userService, "admin"))
	adminGroup.Put("/:id/status", orderController.UpdateOrderStatus)
	adminGroup.Delete("/:id", orderController.DeleteOrder)
	adminGroup.Get("/stats", orderController.GetOrderStats)
}
