package controller

import (
	"app/src/model"
	"app/src/service"
	"app/src/utils"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type ProductController struct {
	productService service.ProductService
}

func NewProductController(productService service.ProductService) *ProductController {
	return &ProductController{
		productService: productService,
	}
}

// @Tags         Products
// @Summary      Get all products with filtering and pagination
// @Accept       json
// @Produce      json
// @Param        page        query     int     false  "Page number"     default(1)
// @Param        limit       query     int     false  "Items per page"  default(10)
// @Param        categoryId  query     string  false  "Category ID filter"
// @Param        search      query     string  false  "Search term"
// @Param        minPrice    query     number  false  "Minimum price"
// @Param        maxPrice    query     number  false  "Maximum price"
// @Router       /products [get]
// @Success      200  {object}  map[string]interface{}  "Products with pagination"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (pc *ProductController) GetProducts(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	categoryID := c.Query("categoryId")
	search := c.Query("search")
	minPrice, _ := strconv.ParseFloat(c.Query("minPrice", "0"), 64)
	maxPrice, _ := strconv.ParseFloat(c.Query("maxPrice", "0"), 64)

	// Get products with filters
	products, total, err := pc.productService.GetProducts(page, limit, categoryID, search, minPrice, maxPrice)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get products", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Products retrieved successfully", fiber.Map{
		"products": products,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// @Tags         Products
// @Summary      Get a single product by ID
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Product ID"
// @Router       /products/{id} [get]
// @Success      200  {object}  model.Product  "Product details"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      404  {object}  map[string]interface{}  "Product not found"
func (pc *ProductController) GetProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Product ID is required", nil)
	}

	product, err := pc.productService.GetProductByID(productID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusNotFound, "Product not found", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Product retrieved successfully", product)
}

// @Tags         Products
// @Summary      Create a new product (Admin only)
// @Accept       json
// @Produce      json
// @Param        request  body      model.Product  true  "Product data"
// @Router       /admin/products [post]
// @Security     BearerAuth
// @Success      201  {object}  model.Product  "Product created successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      403  {object}  map[string]interface{}  "Forbidden - Admin access required"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (pc *ProductController) CreateProduct(c *fiber.Ctx) error {
	var product model.Product
	if err := c.BodyParser(&product); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	createdProduct, err := pc.productService.CreateProduct(&product)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to create product", err)
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Product created successfully", createdProduct)
}

// @Tags         Products
// @Summary      Update an existing product (Admin only)
// @Accept       json
// @Produce      json
// @Param        id       path      string        true   "Product ID"
// @Param        request  body      model.Product  true   "Updated product data"
// @Router       /admin/products/{id} [put]
// @Security     BearerAuth
// @Success      200  {object}  model.Product  "Product updated successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      403  {object}  map[string]interface{}  "Forbidden - Admin access required"
// @Failure      404  {object}  map[string]interface{}  "Product not found"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (pc *ProductController) UpdateProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Product ID is required", nil)
	}

	var product model.Product
	if err := c.BodyParser(&product); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	product.ID = productID
	updatedProduct, err := pc.productService.UpdateProduct(&product)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to update product", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Product updated successfully", updatedProduct)
}

// @Tags         Products
// @Summary      Delete a product (Admin only)
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Product ID"
// @Router       /admin/products/{id} [delete]
// @Security     BearerAuth
// @Success      200  {object}  map[string]interface{}  "Product deleted successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      403  {object}  map[string]interface{}  "Forbidden - Admin access required"
// @Failure      404  {object}  map[string]interface{}  "Product not found"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (pc *ProductController) DeleteProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	if productID == "" {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Product ID is required", nil)
	}

	err := pc.productService.DeleteProduct(productID)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to delete product", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Product deleted successfully", nil)
}

// @Tags         Categories
// @Summary      Get all categories
// @Accept       json
// @Produce      json
// @Router       /categories [get]
// @Success      200  {array}   model.Category  "List of categories"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (pc *ProductController) GetCategories(c *fiber.Ctx) error {
	categories, err := pc.productService.GetCategories()
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to get categories", err)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Categories retrieved successfully", categories)
}

// @Tags         Categories
// @Summary      Create a new category (Admin only)
// @Accept       json
// @Produce      json
// @Param        request  body      model.Category  true  "Category data"
// @Router       /admin/categories [post]
// @Security     BearerAuth
// @Success      201  {object}  model.Category  "Category created successfully"
// @Failure      400  {object}  map[string]interface{}  "Bad request"
// @Failure      401  {object}  map[string]interface{}  "Unauthorized"
// @Failure      403  {object}  map[string]interface{}  "Forbidden - Admin access required"
// @Failure      500  {object}  map[string]interface{}  "Internal server error"
func (pc *ProductController) CreateCategory(c *fiber.Ctx) error {
	var category model.Category
	if err := c.BodyParser(&category); err != nil {
		return utils.ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body", err)
	}

	createdCategory, err := pc.productService.CreateCategory(&category)
	if err != nil {
		return utils.ErrorResponse(c, fiber.StatusInternalServerError, "Failed to create category", err)
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Category created successfully", createdCategory)
}
