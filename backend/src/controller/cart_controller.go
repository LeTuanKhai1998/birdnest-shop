package controller

import (
	"app/src/model"
	"app/src/service"
	"app/src/utils"

	"github.com/gofiber/fiber/v2"
)

type CartController struct {
	cartService service.CartService
}

func NewCartController(cartService service.CartService) *CartController {
	return &CartController{
		cartService: cartService,
	}
}

// @Tags         Cart
// @Summary      Get user's cart items
// @Accept       json
// @Produce      json
// @Router       /cart [get]
// @Security     BearerAuth
// @Success      200  {array}   model.CartItem  "Cart items"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (cc *CartController) GetCartItems(c *fiber.Ctx) error {
	user := c.Locals("user").(*model.User)

	cartItems, err := cc.cartService.GetCartItems(user.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get cart items", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Cart items retrieved successfully", cartItems)
}

// @Tags         Cart
// @Summary      Add item to cart
// @Accept       json
// @Produce      json
// @Param        request  body      object  true  "Cart item data with productId and quantity"
// @Router       /cart [post]
// @Security     BearerAuth
// @Success      201  {object}  model.CartItem  "Item added to cart successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (cc *CartController) AddToCart(c *fiber.Ctx) error {
	var request struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	}

	if err := c.BodyParser(&request); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	if request.Quantity <= 0 {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Quantity must be greater than 0", nil)
	}

	user := c.Locals("user").(*model.User)

	cartItem, err := cc.cartService.AddToCart(user.ID, request.ProductID, request.Quantity)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to add item to cart", err)
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Item added to cart successfully", cartItem)
}

// @Tags         Cart
// @Summary      Update cart item quantity
// @Accept       json
// @Produce      json
// @Param        id       path      string  true  "Cart item ID"
// @Param        request  body      object  true  "Quantity update data"
// @Router       /cart/{id} [put]
// @Security     BearerAuth
// @Success      200  {object}  model.CartItem  "Cart item updated successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      404  {object}  map[string]interface{}  "Cart item not found"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (cc *CartController) UpdateCartItem(c *fiber.Ctx) error {
	cartItemID := c.Params("id")
	if cartItemID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Cart item ID is required", nil)
	}

	var request struct {
		Quantity int `json:"quantity"`
	}

	if err := c.BodyParser(&request); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	if request.Quantity <= 0 {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Quantity must be greater than 0", nil)
	}

	user := c.Locals("user").(*model.User)

	cartItem, err := cc.cartService.UpdateCartItem(cartItemID, user.ID, request.Quantity)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to update cart item", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Cart item updated successfully", cartItem)
}

// @Tags         Cart
// @Summary      Remove item from cart
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Cart item ID"
// @Router       /cart/{id} [delete]
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{}  "Item removed from cart successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      404  {object}  map[string]interface{}  "Cart item not found"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (cc *CartController) RemoveFromCart(c *fiber.Ctx) error {
	cartItemID := c.Params("id")
	if cartItemID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Cart item ID is required", nil)
	}

	user := c.Locals("user").(*model.User)

	err := cc.cartService.RemoveFromCart(cartItemID, user.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to remove item from cart", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Item removed from cart successfully", nil)
}

// @Tags         Cart
// @Summary      Clear all cart items
// @Accept       json
// @Produce      json
// @Router       /cart [delete]
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{}  "Cart cleared successfully"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (cc *CartController) ClearCart(c *fiber.Ctx) error {
	user := c.Locals("user").(*model.User)

	err := cc.cartService.ClearCart(user.ID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to clear cart", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Cart cleared successfully", nil)
}
