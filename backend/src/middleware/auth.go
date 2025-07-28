package middleware

import (
	"app/src/config"
	"app/src/service"
	"app/src/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func Auth(userService service.UserService, requiredRights ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))

		if token == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		userID, err := utils.VerifyToken(token, config.JWTSecret, config.TokenTypeAccess)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		user, err := userService.GetUserByID(c, userID)
		if err != nil || user == nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Please authenticate")
		}

		c.Locals("user", user)

		// If no rights are required, allow access (for profile endpoints)
		if len(requiredRights) == 0 {
			return c.Next()
		}

		// For endpoints with required rights, check permissions
		if !user.IsAdmin && c.Params("userId") != userID {
			return fiber.NewError(fiber.StatusForbidden, "You don't have permission to access this resource")
		}

		return c.Next()
	}
}
