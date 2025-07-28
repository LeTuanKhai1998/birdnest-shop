package router

import (
	"app/src/config"
	"app/src/service"
	"app/src/validation"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func Routes(app *fiber.App, db *gorm.DB) {
	validate := validation.Validator()

	healthCheckService := service.NewHealthCheckService(db)
	emailService := service.NewEmailService()
	userService := service.NewUserService(db, validate)
	tokenService := service.NewTokenService(db, validate, userService)
	authService := service.NewAuthService(db, validate, userService, tokenService)

	v1 := app.Group("/v1")

	HealthCheckRoutes(v1, healthCheckService)
	AuthRoutes(v1, authService, userService, tokenService, emailService)
	UserRoutes(v1, userService, tokenService)
	ProductRoutes(v1, db, validate, userService)
	OrderRoutes(v1, db, validate, userService)
	CartRoutes(v1, db, validate, userService)
	ReviewRoutes(v1, db, validate, userService)
	DashboardRoutes(v1, db, validate)

	// Add docs route outside v1 group to avoid authentication
	if !config.IsProd {
		DocsRoutes(app)
	}
}
