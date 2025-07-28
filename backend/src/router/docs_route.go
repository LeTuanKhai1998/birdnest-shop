package router

import (
	// initialize the Swagger documentation
	_ "app/src/docs"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
)

func DocsRoutes(app *fiber.App) {
	// Add API info endpoint at root level
	app.Get("/api-info", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"title":       "BirdNest Shop API",
			"version":     "1.0.0",
			"description": "BirdNest Shop REST API for e-commerce platform",
			"contact": fiber.Map{
				"name":  "API Support",
				"email": "support@birdnest.vn",
			},
			"license": fiber.Map{
				"name": "MIT",
				"url":  "https://github.com/indrayyana/go-fiber-boilerplate/blob/main/LICENSE",
			},
			"documentation": fiber.Map{
				"swagger_ui":  "http://localhost:8080/docs",
				"json_schema": "http://localhost:8080/docs/swagger.json",
				"yaml_schema": "http://localhost:8080/docs/swagger.yaml",
			},
			"endpoints": fiber.Map{
				"auth":      "Authentication endpoints",
				"products":  "Product management",
				"orders":    "Order management",
				"cart":      "Shopping cart",
				"reviews":   "Product reviews",
				"users":     "User management",
				"dashboard": "Admin dashboard",
			},
		})
	})

	// Serve Swagger UI at root docs path
	app.Get("/docs", func(c *fiber.Ctx) error {
		return c.Redirect("/docs/index.html")
	})

	app.Get("/docs/*", swagger.HandlerDefault)

	// Also serve at /swagger for convenience
	app.Get("/swagger", func(c *fiber.Ctx) error {
		return c.Redirect("/swagger/index.html")
	})

	app.Get("/swagger/*", swagger.HandlerDefault)
}
