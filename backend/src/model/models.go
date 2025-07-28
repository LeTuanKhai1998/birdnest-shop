package model

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"gorm.io/gorm"
)

// User model
type User struct {
	ID          string     `json:"id" gorm:"primaryKey;type:varchar(255)"`
	Email       string     `json:"email" gorm:"type:varchar(255);unique;not null"`
	Password    string     `json:"password" gorm:"type:varchar(255);not null"`
	Name        *string    `json:"name" gorm:"type:varchar(255)"`
	Phone       *string    `json:"phone" gorm:"type:varchar(255);unique"`
	Address     *string    `json:"address" gorm:"type:text"`
	IsAdmin     bool       `json:"isAdmin" gorm:"type:boolean;default:false"`
	Bio         *string    `json:"bio" gorm:"type:text"`
	Orders      []Order    `json:"orders" gorm:"foreignKey:UserID"`
	Reviews     []Review   `json:"reviews" gorm:"foreignKey:UserID"`
	CartItems   []CartItem `json:"cartItems" gorm:"foreignKey:UserID"`
	Addresses   []Address  `json:"addresses" gorm:"foreignKey:UserID"`
	Wishlist    []Wishlist `json:"wishlist" gorm:"foreignKey:UserID"`
	CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	LastLoginAt *time.Time `json:"lastLoginAt" gorm:"type:timestamp"`
}

// Category model
type Category struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	Name      string    `json:"name" gorm:"type:varchar(255);unique;not null"`
	Slug      string    `json:"slug" gorm:"type:varchar(255);unique;not null"`
	Products  []Product `json:"products" gorm:"foreignKey:CategoryID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// Product model
type Product struct {
	ID          string      `json:"id" gorm:"primaryKey;type:varchar(255)"`
	Name        string      `json:"name" gorm:"type:varchar(255);not null"`
	Slug        string      `json:"slug" gorm:"type:varchar(255);unique;not null"`
	Description string      `json:"description" gorm:"type:text;not null"`
	Price       float64     `json:"price" gorm:"type:decimal(10,2);not null"`
	Discount    float64     `json:"discount" gorm:"type:float;default:0"`
	Quantity    int         `json:"quantity" gorm:"type:int;not null"`
	CategoryID  string      `json:"categoryId" gorm:"type:varchar(255);not null"`
	Category    Category    `json:"category" gorm:"foreignKey:CategoryID"`
	Images      []Image     `json:"images" gorm:"foreignKey:ProductID"`
	Reviews     []Review    `json:"reviews" gorm:"foreignKey:ProductID"`
	OrderItems  []OrderItem `json:"orderItems" gorm:"foreignKey:ProductID"`
	CartItems   []CartItem  `json:"cartItems" gorm:"foreignKey:ProductID"`
	Wishlist    []Wishlist  `json:"wishlist" gorm:"foreignKey:ProductID"`
	CreatedAt   time.Time   `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time   `json:"updatedAt" gorm:"autoUpdateTime"`
}

// Image model
type Image struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	URL       string    `json:"url" gorm:"type:text;not null"`
	IsPrimary bool      `json:"isPrimary" gorm:"type:boolean;default:false"`
	ProductID string    `json:"productId" gorm:"type:varchar(255);not null"`
	Product   Product   `json:"product" gorm:"foreignKey:ProductID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Order model
type Order struct {
	ID              string        `json:"id" gorm:"primaryKey;type:varchar(255)"`
	UserID          string        `json:"userId" gorm:"type:varchar(255);not null"`
	User            User          `json:"user" gorm:"foreignKey:UserID"`
	Total           float64       `json:"total" gorm:"type:decimal(10,2);not null"`
	Status          OrderStatus   `json:"status" gorm:"type:order_status;default:'PENDING'"`
	PaymentMethod   PaymentMethod `json:"paymentMethod" gorm:"type:payment_method;default:'COD'"`
	ShippingAddress string        `json:"shippingAddress" gorm:"type:text;not null"`
	OrderItems      []OrderItem   `json:"orderItems" gorm:"foreignKey:OrderID"`
	CreatedAt       time.Time     `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt       time.Time     `json:"updatedAt" gorm:"autoUpdateTime"`
}

// OrderItem model
type OrderItem struct {
	ID        string  `json:"id" gorm:"primaryKey;type:varchar(255)"`
	OrderID   string  `json:"orderId" gorm:"type:varchar(255);not null"`
	Order     Order   `json:"order" gorm:"foreignKey:OrderID"`
	ProductID string  `json:"productId" gorm:"type:varchar(255);not null"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`
	Quantity  int     `json:"quantity" gorm:"type:int;not null"`
	Price     float64 `json:"price" gorm:"type:decimal(10,2);not null"`
}

// Review model
type Review struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	UserID    string    `json:"userId" gorm:"type:varchar(255);not null"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	ProductID string    `json:"productId" gorm:"type:varchar(255);not null"`
	Product   Product   `json:"product" gorm:"foreignKey:ProductID"`
	Rating    int       `json:"rating" gorm:"type:int;not null"`
	Comment   *string   `json:"comment" gorm:"type:text"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// CartItem model
type CartItem struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	UserID    string    `json:"userId" gorm:"type:varchar(255);not null"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	ProductID string    `json:"productId" gorm:"type:varchar(255);not null"`
	Product   Product   `json:"product" gorm:"foreignKey:ProductID"`
	Quantity  int       `json:"quantity" gorm:"type:int;default:1"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// Address model
type Address struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	UserID    string    `json:"userId" gorm:"type:varchar(255);not null"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	FullName  string    `json:"fullName" gorm:"type:varchar(255);not null"`
	Phone     string    `json:"phone" gorm:"type:varchar(255);not null"`
	Address   string    `json:"address" gorm:"type:text;not null"`
	Apartment *string   `json:"apartment" gorm:"type:varchar(255)"`
	Province  string    `json:"province" gorm:"type:varchar(255);not null"`
	District  string    `json:"district" gorm:"type:varchar(255);not null"`
	Ward      string    `json:"ward" gorm:"type:varchar(255);not null"`
	Country   string    `json:"country" gorm:"type:varchar(255);not null"`
	IsDefault bool      `json:"isDefault" gorm:"type:boolean;default:false"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// Wishlist model
type Wishlist struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	UserID    string    `json:"userId" gorm:"type:varchar(255);not null"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	ProductID string    `json:"productId" gorm:"type:varchar(255);not null"`
	Product   Product   `json:"product" gorm:"foreignKey:ProductID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Token model
type Token struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(255)"`
	UserID    string    `json:"userId" gorm:"type:varchar(255);not null"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Token     string    `json:"token" gorm:"type:text;not null"`
	Type      string    `json:"type" gorm:"type:varchar(50);not null"`
	ExpiresAt time.Time `json:"expiresAt" gorm:"type:timestamp;not null"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Enums
type OrderStatus string
type PaymentMethod string

const (
	OrderStatusPending   OrderStatus = "PENDING"
	OrderStatusPaid      OrderStatus = "PAID"
	OrderStatusShipped   OrderStatus = "SHIPPED"
	OrderStatusDelivered OrderStatus = "DELIVERED"
	OrderStatusCancelled OrderStatus = "CANCELLED"
)

const (
	PaymentMethodCOD          PaymentMethod = "COD"
	PaymentMethodBankTransfer PaymentMethod = "BANK_TRANSFER"
	PaymentMethodStripe       PaymentMethod = "STRIPE"
	PaymentMethodMomo         PaymentMethod = "MOMO"
	PaymentMethodVnpay        PaymentMethod = "VNPAY"
)

// Table names
func (User) TableName() string      { return "users" }
func (Category) TableName() string  { return "categories" }
func (Product) TableName() string   { return "products" }
func (Image) TableName() string     { return "images" }
func (Order) TableName() string     { return "orders" }
func (OrderItem) TableName() string { return "order_items" }
func (Review) TableName() string    { return "reviews" }
func (CartItem) TableName() string  { return "cart_items" }
func (Address) TableName() string   { return "addresses" }
func (Wishlist) TableName() string  { return "wishlist" }
func (Token) TableName() string     { return "tokens" }

// BeforeCreate hooks for ID generation
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = generateID()
	}
	return nil
}

func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = generateID()
	}
	return nil
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = generateID()
	}
	return nil
}

func (i *Image) BeforeCreate(tx *gorm.DB) error {
	if i.ID == "" {
		i.ID = generateID()
	}
	return nil
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == "" {
		o.ID = generateID()
	}
	return nil
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == "" {
		oi.ID = generateID()
	}
	return nil
}

func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = generateID()
	}
	return nil
}

func (ci *CartItem) BeforeCreate(tx *gorm.DB) error {
	if ci.ID == "" {
		ci.ID = generateID()
	}
	return nil
}

func (a *Address) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = generateID()
	}
	return nil
}

func (w *Wishlist) BeforeCreate(tx *gorm.DB) error {
	if w.ID == "" {
		w.ID = generateID()
	}
	return nil
}

func (t *Token) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = generateID()
	}
	return nil
}

// generateID generates a random ID similar to CUID
func generateID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
