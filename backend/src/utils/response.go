package utils

import (
	"app/src/response"

	"github.com/gofiber/fiber/v2"
)

// ErrorResponse creates a standardized error response
func ErrorResponse(c *fiber.Ctx, statusCode int, message string, err error) error {
	return response.Error(c, statusCode, message, err)
}

// SuccessResponse creates a standardized success response
func SuccessResponse(c *fiber.Ctx, statusCode int, message string, data interface{}) error {
	return c.Status(statusCode).JSON(fiber.Map{
		"code":    statusCode,
		"status":  "success",
		"message": message,
		"data":    data,
	})
}
