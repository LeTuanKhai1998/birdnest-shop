package router

import (
	"app/src/controller"
	m "app/src/middleware"
	"app/src/service"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func CartRoutes(router fiber.Router, db *gorm.DB, validate *validator.Validate, userService service.UserService) {
	cartService := service.NewCartService(db, validate)
	cartController := controller.NewCartController(cartService)

	// Cart routes (require authentication)
	cartGroup := router.Group("/cart", m.Auth(userService))
	cartGroup.Get("/", cartController.GetCartItems)
	cartGroup.Post("/", cartController.AddToCart)
	cartGroup.Put("/:id", cartController.UpdateCartItem)
	cartGroup.Delete("/:id", cartController.RemoveFromCart)
	cartGroup.Delete("/", cartController.ClearCart)
}
