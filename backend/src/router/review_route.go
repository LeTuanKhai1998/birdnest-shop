package router

import (
	"app/src/controller"
	m "app/src/middleware"
	"app/src/service"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func ReviewRoutes(router fiber.Router, db *gorm.DB, validate *validator.Validate, userService service.UserService) {
	reviewService := service.NewReviewService(db, validate)
	reviewController := controller.NewReviewController(reviewService)

	// Public routes
	router.Get("/products/:id/reviews", reviewController.GetProductReviews)

	// User routes (require authentication)
	userGroup := router.Group("/", m.Auth(userService))
	userGroup.Post("/products/:id/reviews", reviewController.CreateReview)
	userGroup.Put("/reviews/:id", reviewController.UpdateReview)
	userGroup.Delete("/reviews/:id", reviewController.DeleteReview)
	userGroup.Get("/users/reviews", reviewController.GetUserReviews)
}
