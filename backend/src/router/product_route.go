package router

import (
	"app/src/controller"
	m "app/src/middleware"
	"app/src/service"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func ProductRoutes(router fiber.Router, db *gorm.DB, validate *validator.Validate, userService service.UserService) {
	productService := service.NewProductService(db, validate)
	productController := controller.NewProductController(productService)

	// Public routes
	router.Get("/products", productController.GetProducts)
	router.Get("/products/:id", productController.GetProduct)
	router.Get("/categories", productController.GetCategories)

	// Admin routes (require authentication and admin privileges)
	adminGroup := router.Group("/admin")
	adminGroup.Post("/products", m.Auth(userService, "admin"), productController.CreateProduct)
	adminGroup.Put("/products/:id", m.Auth(userService, "admin"), productController.UpdateProduct)
	adminGroup.Delete("/products/:id", m.Auth(userService, "admin"), productController.DeleteProduct)
	adminGroup.Post("/categories", m.Auth(userService, "admin"), productController.CreateCategory)
}
