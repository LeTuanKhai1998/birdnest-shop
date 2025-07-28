package controller

import (
	"app/src/service"
	"app/src/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type DashboardController struct {
	dashboardService service.DashboardService
}

func NewDashboardController(dashboardService service.DashboardService) *DashboardController {
	return &DashboardController{
		dashboardService: dashboardService,
	}
}

// @Tags         Dashboard
// @Summary      Get dashboard metrics
// @Description  Get key dashboard metrics including total revenue, orders, customers, and trends
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Router       /dashboard/metrics [get]
// @Success      200  {object}  service.DashboardMetrics
// @Failure      500  {object}  response.Common
// GetDashboardMetrics returns key dashboard metrics
func (dc *DashboardController) GetDashboardMetrics(c *fiber.Ctx) error {
	metrics, err := dc.dashboardService.GetDashboardMetrics()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get dashboard metrics", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Dashboard metrics retrieved successfully", metrics)
}

// @Tags         Dashboard
// @Summary      Get revenue chart data
// @Description  Get revenue and order data for charts with period filtering
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        period  query  string  false  "Period (daily, weekly, monthly, yearly)"  default(daily)
// @Param        days    query  int     false  "Number of days to look back"              default(30)
// @Router       /dashboard/revenue-chart [get]
// @Success      200  {array}   service.ChartData
// @Failure      400  {object}  response.Common
// @Failure      500  {object}  response.Common
// GetRevenueChart returns revenue data for charts
func (dc *DashboardController) GetRevenueChart(c *fiber.Ctx) error {
	period := c.Query("period", "daily") // daily, weekly, monthly, yearly
	days := c.Query("days", "30")

	daysInt, err := strconv.Atoi(days)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid days parameter", err)
	}

	chartData, err := dc.dashboardService.GetRevenueChart(period, daysInt)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get revenue chart data", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Revenue chart data retrieved successfully", chartData)
}

// GetOrderStatistics returns order statistics for charts
func (dc *DashboardController) GetOrderStatistics(c *fiber.Ctx) error {
	period := c.Query("period", "daily")
	days := c.Query("days", "30")

	daysInt, err := strconv.Atoi(days)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid days parameter", err)
	}

	stats, err := dc.dashboardService.GetOrderStatistics(period, daysInt)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get order statistics", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Order statistics retrieved successfully", stats)
}

// GetTopProducts returns top selling products
func (dc *DashboardController) GetTopProducts(c *fiber.Ctx) error {
	limit := c.Query("limit", "10")

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid limit parameter", err)
	}

	products, err := dc.dashboardService.GetTopProducts(limitInt)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get top products", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Top products retrieved successfully", products)
}

// GetLowStockProducts returns products with low stock
func (dc *DashboardController) GetLowStockProducts(c *fiber.Ctx) error {
	threshold := c.Query("threshold", "10")

	thresholdInt, err := strconv.Atoi(threshold)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid threshold parameter", err)
	}

	products, err := dc.dashboardService.GetLowStockProducts(thresholdInt)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get low stock products", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Low stock products retrieved successfully", products)
}

// GetCustomerInsights returns customer analytics
func (dc *DashboardController) GetCustomerInsights(c *fiber.Ctx) error {
	insights, err := dc.dashboardService.GetCustomerInsights()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get customer insights", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Customer insights retrieved successfully", insights)
}

// GetTopCustomers returns top customers by revenue
func (dc *DashboardController) GetTopCustomers(c *fiber.Ctx) error {
	limit := c.Query("limit", "10")

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid limit parameter", err)
	}

	customers, err := dc.dashboardService.GetTopCustomers(limitInt)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get top customers", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Top customers retrieved successfully", customers)
}
