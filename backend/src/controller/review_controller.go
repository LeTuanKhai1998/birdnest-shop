package controller

import (
	"app/src/model"
	"app/src/service"
	"app/src/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type ReviewController struct {
	reviewService service.ReviewService
}

func NewReviewController(reviewService service.ReviewService) *ReviewController {
	return &ReviewController{
		reviewService: reviewService,
	}
}

// @Tags         Reviews
// @Summary      Get reviews for a product
// @Accept       json
// @Produce      json
// @Param        id      path      string  true   "Product ID"
// @Param        page    query     int     false  "Page number"     default(1)
// @Param        limit   query     int     false  "Items per page"  default(10)
// @Router       /products/{id}/reviews [get]
// @Success      200  {object}  map[string]interface{}  "Reviews with pagination"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (rc *ReviewController) GetProductReviews(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Product ID is required", nil)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	reviews, total, err := rc.reviewService.GetProductReviews(productID, page, limit)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get reviews", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Reviews retrieved successfully", fiber.Map{
		"reviews": reviews,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// @Tags         Reviews
// @Summary      Create a review for a product
// @Accept       json
// @Produce      json
// @Param        id       path      string  true  "Product ID"
// @Param        request  body      object  true  "Review data with rating and optional comment"
// @Router       /products/{id}/reviews [post]
// @Security     BearerAuth
// @Success      201  {object}  model.Review  "Review created successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (rc *ReviewController) CreateReview(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Product ID is required", nil)
	}

	var request struct {
		Rating  int     `json:"rating"`
		Comment *string `json:"comment"`
	}

	if err := c.BodyParser(&request); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	user := c.Locals("user").(*model.User)

	review, err := rc.reviewService.CreateReview(user.ID, productID, request.Rating, request.Comment)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to create review", err)
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Review created successfully", review)
}

// @Tags         Reviews
// @Summary      Update a review
// @Accept       json
// @Produce      json
// @Param        id       path      string  true  "Review ID"
// @Param        request  body      object  true  "Updated review data"
// @Router       /reviews/{id} [put]
// @Security     BearerAuth
// @Success      200  {object}  model.Review  "Review updated successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      404  {object}  map[string]interface{}  "Review not found"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (rc *ReviewController) UpdateReview(c *fiber.Ctx) error {
	reviewID := c.Params("id")
	if reviewID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Review ID is required", nil)
	}

	var request struct {
		Rating  int     `json:"rating"`
		Comment *string `json:"comment"`
	}

	if err := c.BodyParser(&request); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	user := c.Locals("user").(*model.User)

	review, err := rc.reviewService.UpdateReview(reviewID, user.ID, request.Rating, request.Comment)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to update review", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Review updated successfully", review)
}

// @Tags         Reviews
// @Summary      Delete a review
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Review ID"
// @Router       /reviews/{id} [delete]
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{}  "Review deleted successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      404  {object}  map[string]interface{}  "Review not found"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (rc *ReviewController) DeleteReview(c *fiber.Ctx) error {
	reviewID := c.Params("id")
	if reviewID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Review ID is required", nil)
	}

	user := c.Locals("user").(*model.User)

	err := rc.reviewService.DeleteReview(reviewID, user.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to delete review", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Review deleted successfully", nil)
}

// @Tags         Reviews
// @Summary      Get user's reviews
// @Accept       json
// @Produce      json
// @Param        page   query     int  false  "Page number"     default(1)
// @Param        limit  query     int  false  "Items per page"  default(10)
// @Router       /reviews [get]
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{}  "User reviews with pagination"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (rc *ReviewController) GetUserReviews(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	user := c.Locals("user").(*model.User)

	reviews, total, err := rc.reviewService.GetUserReviews(user.ID, page, limit)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get user reviews", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "User reviews retrieved successfully", fiber.Map{
		"reviews": reviews,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}
