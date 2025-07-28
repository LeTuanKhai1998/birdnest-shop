package router

import (
	"app/src/controller"
	m "app/src/middleware"
	"app/src/service"

	"github.com/gofiber/fiber/v2"
)

func UserRoutes(v1 fiber.Router, u service.UserService, t service.TokenService) {
	userController := controller.NewUserController(u, t)

	user := v1.Group("/users")

	user.Get("/", m.Auth(u, "getUsers"), userController.GetUsers)
	user.Post("/", m.Auth(u, "manageUsers"), userController.CreateUser)

	// Profile routes (must be defined before parameterized routes)
	user.Get("/profile", m.Auth(u), userController.GetProfile)
	user.Put("/profile", m.Auth(u), userController.UpdateProfile)
	user.Put("/profile/password", m.Auth(u), userController.UpdatePassword)

	// Parameterized routes (must be defined after specific routes)
	user.Get("/:userId", m.Auth(u, "getUsers"), userController.GetUserByID)
	user.Patch("/:userId", m.Auth(u, "manageUsers"), userController.UpdateUser)
	user.Delete("/:userId", m.Auth(u, "manageUsers"), userController.DeleteUser)
}
