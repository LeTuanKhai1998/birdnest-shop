package controller

import (
	"app/src/model"
	"app/src/service"
	"app/src/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type OrderController struct {
	orderService service.OrderService
}

func NewOrderController(orderService service.OrderService) *OrderController {
	return &OrderController{
		orderService: orderService,
	}
}

// @Tags         Orders
// @Summary      Create a new order
// @Accept       json
// @Produce      json
// @Param        request  body      object  true  "Order data with items, shipping address, and payment method"
// @Router       /orders [post]
// @Security     BearerAuth
// @Success      201  {object}  model.Order  "Order created successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (oc *OrderController) CreateOrder(c *fiber.Ctx) error {
	var orderRequest struct {
		Items           []model.OrderItem   `json:"items"`
		ShippingAddress string              `json:"shippingAddress"`
		PaymentMethod   model.PaymentMethod `json:"paymentMethod"`
	}

	if err := c.BodyParser(&orderRequest); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	// Get user from context (set by auth middleware)
	user := c.Locals("user").(*model.User)

	order, err := oc.orderService.CreateOrder(user.ID, orderRequest.Items, orderRequest.ShippingAddress, orderRequest.PaymentMethod)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to create order", err)
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Order created successfully", order)
}

// @Tags         Orders
// @Summary      Get user's orders or all orders (admin)
// @Accept       json
// @Produce      json
// @Param        page    query     int     false  "Page number"     default(1)
// @Param        limit   query     int     false  "Items per page"  default(10)
// @Param        status  query     string  false  "Order status filter"
// @Router       /orders [get]
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{}  "Orders with pagination"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (oc *OrderController) GetOrders(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	status := c.Query("status")

	user := c.Locals("user").(*model.User)

	orders, total, err := oc.orderService.GetOrders(user.ID, user.IsAdmin, page, limit, status)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get orders", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Orders retrieved successfully", fiber.Map{
		"orders": orders,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// @Tags         Orders
// @Summary      Get a specific order
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Order ID"
// @Router       /orders/{id} [get]
// @Security     BearerAuth
// @Success      200  {object}  model.Order  "Order details"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      404  {object}  map[string]interface{}  "Order not found"
func (oc *OrderController) GetOrder(c *fiber.Ctx) error {
	orderID := c.Params("id")
	if orderID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Order ID is required", nil)
	}

	user := c.Locals("user").(*model.User)

	order, err := oc.orderService.GetOrderByID(orderID, user.ID, user.IsAdmin)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "Order not found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Order retrieved successfully", order)
}

// @Tags         Orders
// @Summary      Update order status (admin only)
// @Accept       json
// @Produce      json
// @Param        id       path      string  true  "Order ID"
// @Param        request  body      object  true  "Status update data"
// @Router       /admin/orders/{id}/status [put]
// @Security     BearerAuth
// @Success      200  {object}  model.Order  "Order status updated successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      403  {object}  map[string]interface{}  "Forbidden - Admin access required"
// @Failure      404  {object}  map[string]interface{}  "Order not found"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (oc *OrderController) UpdateOrderStatus(c *fiber.Ctx) error {
	orderID := c.Params("id")
	if orderID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Order ID is required", nil)
	}

	var statusRequest struct {
		Status model.OrderStatus `json:"status"`
	}

	if err := c.BodyParser(&statusRequest); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	user := c.Locals("user").(*model.User)
	if !user.IsAdmin {
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Only admins can update order status", nil)
	}

	order, err := oc.orderService.UpdateOrderStatus(orderID, statusRequest.Status)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to update order status", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Order status updated successfully", order)
}

// @Tags         Orders
// @Summary      Delete an order (admin only)
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Order ID"
// @Router       /admin/orders/{id} [delete]
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{}  "Order deleted successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      403  {object}  map[string]interface{}  "Forbidden - Admin access required"
// @Failure      404  {object}  map[string]interface{}  "Order not found"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (oc *OrderController) DeleteOrder(c *fiber.Ctx) error {
	orderID := c.Params("id")
	if orderID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Order ID is required", nil)
	}

	user := c.Locals("user").(*model.User)
	if !user.IsAdmin {
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Only admins can delete orders", nil)
	}

	err := oc.orderService.DeleteOrder(orderID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to delete order", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Order deleted successfully", nil)
}

// @Tags         Orders
// @Summary      Get order statistics (admin only)
// @Accept       json
// @Produce      json
// @Param        period  query     string  false  "Statistics period (daily, weekly, monthly, yearly)"  default(daily)
// @Router       /admin/orders/stats [get]
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{}  "Order statistics"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      403  {object}  map[string]interface{}  "Forbidden - Admin access required"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (oc *OrderController) GetOrderStats(c *fiber.Ctx) error {
	user := c.Locals("user").(*model.User)
	if !user.IsAdmin {
		return utils.ErrorResponse(c, fiber.StatusForbidden, "Only admins can view order statistics", nil)
	}

	period := c.Query("period", "daily") // daily, weekly, monthly, yearly

	stats, err := oc.orderService.GetOrderStats(period)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get order statistics", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Order statistics retrieved successfully", stats)
}
