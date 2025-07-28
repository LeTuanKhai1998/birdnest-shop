package seeder

import (
	"app/src/model"
	"app/src/utils"
	"log"

	"gorm.io/gorm"
)

// Seeder struct to hold database connection
type Seeder struct {
	db *gorm.DB
}

// NewSeeder creates a new seeder instance
func NewSeeder(db *gorm.DB) *Seeder {
	return &Seeder{db: db}
}

// Run executes all seeders
func (s *Seeder) Run() error {
	log.Println("Starting database seeding...")

	// Run seeders in order
	if err := s.seedCategories(); err != nil {
		return err
	}

	if err := s.seedProducts(); err != nil {
		return err
	}

	if err := s.seedUsers(); err != nil {
		return err
	}

	if err := s.seedOrders(); err != nil {
		return err
	}

	if err := s.seedReviews(); err != nil {
		return err
	}

	log.Println("Database seeding completed successfully!")
	return nil
}

// seedCategories seeds the categories table
func (s *Seeder) seedCategories() error {
	log.Println("Seeding categories...")

	categories := []model.Category{
		{
			Name: "Refined Nest",
			Slug: "refined-nest",
		},
		{
			Name: "Raw Nest",
			Slug: "raw-nest",
		},
		{
			Name: "Feather-removed Nest",
			Slug: "feather-removed-nest",
		},
		{
			Name: "Combo",
			Slug: "combo",
		},
	}

	for _, category := range categories {
		if err := s.db.Where("slug = ?", category.Slug).FirstOrCreate(&category).Error; err != nil {
			return err
		}
		log.Printf("Created category: %s", category.Name)
	}

	return nil
}

// seedProducts seeds the products table
func (s *Seeder) seedProducts() error {
	log.Println("Seeding products...")

	// Get categories first
	var categories []model.Category
	if err := s.db.Find(&categories).Error; err != nil {
		return err
	}

	// Create a map for easy lookup
	categoryMap := make(map[string]string)
	for _, cat := range categories {
		categoryMap[cat.Slug] = cat.ID
	}

	products := []struct {
		Name         string
		Slug         string
		Description  string
		Price        float64
		Quantity     int
		CategorySlug string
		Images       []string
	}{
		// Refined Nest Products
		{
			Name:         "Yến Tinh Chế Khánh Hòa 50g",
			Slug:         "yen-tinh-che-khanh-hoa-50g",
			Description:  "Yến tinh chế Khánh Hòa chất lượng cao, được làm sạch kỹ lưỡng, loại bỏ tạp chất. Nguồn gốc từ các đảo yến tự nhiên tại Khánh Hòa. Phù hợp cho việc sử dụng hàng ngày, tăng cường sức khỏe và sức đề kháng.",
			Price:        3500000,
			Quantity:     25,
			CategorySlug: "refined-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Yến Tinh Chế Cần Giờ 100g",
			Slug:         "yen-tinh-che-can-gio-100g",
			Description:  "Yến tinh chế Cần Giờ 100g, được thu hoạch từ các đảo yến tự nhiên tại Cần Giờ. Quy trình tinh chế nghiêm ngặt, giữ nguyên dưỡng chất tự nhiên. Tăng cường miễn dịch, đẹp da, chống lão hóa.",
			Price:        6500000,
			Quantity:     15,
			CategorySlug: "refined-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Yến Tinh Chế Kiên Giang 200g",
			Slug:         "yen-tinh-che-kien-giang-200g",
			Description:  "Yến tinh chế Kiên Giang 200g, chất lượng cao cấp từ vùng biển Kiên Giang. Được chọn lọc kỹ lưỡng, tinh chế theo công nghệ hiện đại. Bổ sung collagen tự nhiên, tốt cho sức khỏe và sắc đẹp.",
			Price:        12000000,
			Quantity:     8,
			CategorySlug: "refined-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Yến Tinh Chế Sóc Trăng 50g",
			Slug:         "yen-tinh-che-soc-trang-50g",
			Description:  "Yến tinh chế Sóc Trăng 50g, nguồn gốc từ các đảo yến tại Sóc Trăng. Được làm sạch hoàn toàn, loại bỏ lông và tạp chất. Tăng cường sức đề kháng, bồi bổ sức khỏe cho mọi lứa tuổi.",
			Price:        3400000,
			Quantity:     20,
			CategorySlug: "refined-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Yến Tinh Chế Nha Trang 100g",
			Slug:         "yen-tinh-che-nha-trang-100g",
			Description:  "Yến tinh chế Nha Trang 100g, thương hiệu uy tín từ vùng biển Nha Trang. Được chế biến theo công nghệ tiên tiến, giữ nguyên hương vị tự nhiên. Tốt cho hệ hô hấp và sức khỏe tổng thể.",
			Price:        6800000,
			Quantity:     12,
			CategorySlug: "refined-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},

		// Raw Nest Products
		{
			Name:         "Yến Thô Khánh Hòa 100g",
			Slug:         "yen-tho-khanh-hoa-100g",
			Description:  "Yến thô Khánh Hòa 100g, nguyên bản từ tổ yến tự nhiên. Chưa qua xử lý, giữ nguyên hình dạng và dưỡng chất tự nhiên. Phù hợp cho những ai muốn tự chế biến theo cách truyền thống.",
			Price:        2800000,
			Quantity:     18,
			CategorySlug: "raw-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Yến Thô Cần Giờ 200g",
			Slug:         "yen-tho-can-gio-200g",
			Description:  "Yến thô Cần Giờ 200g, tổ yến nguyên bản từ đảo Cần Giờ. Chất lượng cao, hàm lượng dinh dưỡng phong phú. Cần chế biến cẩn thận trước khi sử dụng.",
			Price:        5200000,
			Quantity:     10,
			CategorySlug: "raw-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Yến Thô Kiên Giang 150g",
			Slug:         "yen-tho-kien-giang-150g",
			Description:  "Yến thô Kiên Giang 150g, tổ yến tự nhiên từ vùng biển Kiên Giang. Được thu hoạch thủ công, đảm bảo chất lượng. Giàu protein và các khoáng chất thiết yếu.",
			Price:        4200000,
			Quantity:     15,
			CategorySlug: "raw-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},

		// Feather-removed Nest Products
		{
			Name:         "Yến Rút Lông Nha Trang 50g",
			Slug:         "yen-rut-long-nha-trang-50g",
			Description:  "Yến rút lông Nha Trang 50g, đã được loại bỏ lông chim cẩn thận. Giữ nguyên dưỡng chất, dễ chế biến. Tăng cường sức khỏe, đẹp da, chống lão hóa hiệu quả.",
			Price:        4000000,
			Quantity:     22,
			CategorySlug: "feather-removed-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Yến Rút Lông Khánh Hòa 100g",
			Slug:         "yen-rut-long-khanh-hoa-100g",
			Description:  "Yến rút lông Khánh Hòa 100g, được xử lý kỹ lưỡng loại bỏ lông chim. Chất lượng cao, hương vị thơm ngon. Bổ sung collagen tự nhiên, tốt cho sức khỏe và sắc đẹp.",
			Price:        7500000,
			Quantity:     12,
			CategorySlug: "feather-removed-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Yến Rút Lông Cần Giờ 200g",
			Slug:         "yen-rut-long-can-gio-200g",
			Description:  "Yến rút lông Cần Giờ 200g, đã được làm sạch lông chim hoàn toàn. Nguồn gốc từ đảo Cần Giờ, chất lượng đảm bảo. Tăng cường miễn dịch, bồi bổ sức khỏe toàn diện.",
			Price:        14000000,
			Quantity:     8,
			CategorySlug: "feather-removed-nest",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},

		// Combo Products
		{
			Name:         "Combo Yến Tinh Chế Cao Cấp",
			Slug:         "combo-yen-tinh-che-cao-cap",
			Description:  "Combo yến tinh chế cao cấp bao gồm: Yến tinh chế Khánh Hòa 50g + Mật ong rừng nguyên chất 500ml + Hộp quà cao cấp. Quà tặng hoàn hảo cho người thân, bạn bè trong các dịp đặc biệt.",
			Price:        4500000,
			Quantity:     20,
			CategorySlug: "combo",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Combo Gia Đình Yến Sào",
			Slug:         "combo-gia-dinh-yen-sao",
			Description:  "Combo gia đình yến sào bao gồm: Yến tinh chế 100g + Yến rút lông 50g + Mật ong rừng 1kg + Hướng dẫn chế biến. Phù hợp cho gia đình sử dụng hàng ngày, tăng cường sức khỏe.",
			Price:        8500000,
			Quantity:     15,
			CategorySlug: "combo",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Combo Quà Tặng Doanh Nghiệp",
			Slug:         "combo-qua-tang-doanh-nghiep",
			Description:  "Combo quà tặng doanh nghiệp cao cấp: Yến tinh chế 200g + Mật ong rừng 1kg + Trà sen 100g + Hộp quà sang trọng. Phù hợp làm quà tặng đối tác, khách hàng VIP.",
			Price:        15000000,
			Quantity:     10,
			CategorySlug: "combo",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
		{
			Name:         "Combo Sức Khỏe Toàn Diện",
			Slug:         "combo-suc-khoe-toan-dien",
			Description:  "Combo sức khỏe toàn diện: Yến tinh chế 100g + Yến thô 100g + Mật ong rừng 500ml + Trà gừng 50g + Hướng dẫn sử dụng. Bổ sung dinh dưỡng toàn diện cho cả gia đình.",
			Price:        6800000,
			Quantity:     18,
			CategorySlug: "combo",
			Images: []string{
				"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
				"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
			},
		},
	}

	for _, productData := range products {
		// Check if product already exists
		var existingProduct model.Product
		if err := s.db.Where("slug = ?", productData.Slug).First(&existingProduct).Error; err == nil {
			log.Printf("Product already exists: %s", productData.Name)
			continue
		}

		// Create product
		product := model.Product{
			Name:        productData.Name,
			Slug:        productData.Slug,
			Description: productData.Description,
			Price:       productData.Price,
			Quantity:    productData.Quantity,
			CategoryID:  categoryMap[productData.CategorySlug],
		}

		if err := s.db.Create(&product).Error; err != nil {
			return err
		}

		// Create images for the product
		for i, imageURL := range productData.Images {
			image := model.Image{
				URL:       imageURL,
				IsPrimary: i == 0, // First image is primary
				ProductID: product.ID,
			}
			if err := s.db.Create(&image).Error; err != nil {
				return err
			}
		}

		log.Printf("Created product: %s", product.Name)
	}

	return nil
}

// seedUsers seeds the users table
func (s *Seeder) seedUsers() error {
	log.Println("Seeding users...")

	// Hash passwords
	adminPassword, _ := utils.HashPassword("admin123")
	customerPassword, _ := utils.HashPassword("password123")

	users := []model.User{
		{
			Email:    "admin@birdnest.com",
			Password: adminPassword,
			Name:     utils.StringPtr("Admin User"),
			Phone:    utils.StringPtr("+84901234567"),
			Address:  utils.StringPtr("123 Admin Street, Ho Chi Minh City"),
			IsAdmin:  true,
		},
		{
			Email:    "customer1@example.com",
			Password: customerPassword,
			Name:     utils.StringPtr("Nguyen Van A"),
			Phone:    utils.StringPtr("+84901234568"),
			Address:  utils.StringPtr("456 Customer Street, Hanoi"),
			IsAdmin:  false,
		},
		{
			Email:    "customer2@example.com",
			Password: customerPassword,
			Name:     utils.StringPtr("Tran Thi B"),
			Phone:    utils.StringPtr("+84901234569"),
			Address:  utils.StringPtr("789 Customer Street, Da Nang"),
			IsAdmin:  false,
		},
	}

	for _, user := range users {
		if err := s.db.Where("email = ?", user.Email).FirstOrCreate(&user).Error; err != nil {
			return err
		}
		log.Printf("Created user: %s", *user.Name)
	}

	return nil
}

// seedOrders seeds the orders table
func (s *Seeder) seedOrders() error {
	log.Println("Seeding orders...")

	// Get users and products
	var users []model.User
	if err := s.db.Find(&users).Error; err != nil {
		return err
	}

	var products []model.Product
	if err := s.db.Preload("Category").Find(&products).Error; err != nil {
		return err
	}

	// Create orders for customers (skip admin)
	for _, user := range users {
		if user.IsAdmin {
			continue
		}

		// Create 2-3 orders per customer
		for i := 0; i < 2; i++ {
			// Use default address if user address is nil
			shippingAddress := "123 Main Street, Ho Chi Minh City, Vietnam"
			if user.Address != nil {
				shippingAddress = *user.Address
			}

			order := model.Order{
				UserID:          user.ID,
				Total:           products[i%len(products)].Price * float64(i+1),
				Status:          model.OrderStatusDelivered,
				PaymentMethod:   model.PaymentMethodCOD,
				ShippingAddress: shippingAddress,
			}

			if err := s.db.Create(&order).Error; err != nil {
				return err
			}

			// Create order items
			product := products[i%len(products)]
			orderItem := model.OrderItem{
				OrderID:   order.ID,
				ProductID: product.ID,
				Quantity:  i + 1,
				Price:     product.Price,
			}

			if err := s.db.Create(&orderItem).Error; err != nil {
				return err
			}

			log.Printf("Created order: %s for user %s", order.ID, *user.Name)
		}
	}

	return nil
}

// seedReviews seeds the reviews table
func (s *Seeder) seedReviews() error {
	log.Println("Seeding reviews...")

	// Get users and products
	var users []model.User
	if err := s.db.Find(&users).Error; err != nil {
		return err
	}

	var products []model.Product
	if err := s.db.Find(&products).Error; err != nil {
		return err
	}

	// Create reviews for each product
	for _, product := range products {
		for i, user := range users {
			if user.IsAdmin {
				continue
			}

			// Create 1-2 reviews per product
			if i < 2 {
				comment := "Great product! Very satisfied with the quality."
				if i == 1 {
					comment = "Excellent birdnest, highly recommended!"
				}

				review := model.Review{
					UserID:    user.ID,
					ProductID: product.ID,
					Rating:    5,
					Comment:   &comment,
				}

				if err := s.db.Create(&review).Error; err != nil {
					return err
				}

				log.Printf("Created review for product: %s", product.Name)
			}
		}
	}

	return nil
}
