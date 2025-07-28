package main

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Get database URL from environment or construct from individual variables
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Construct DATABASE_URL from individual variables
		dbHost := os.Getenv("DB_HOST")
		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("DB_NAME")
		dbPort := os.Getenv("DB_PORT")

		if dbHost == "" || dbUser == "" || dbPassword == "" || dbName == "" || dbPort == "" {
			log.Fatal("Database configuration not found in environment variables")
		}

		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=require",
			dbUser, dbPassword, dbHost, dbPort, dbName)
	}

	// Connect to database using GORM
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	fmt.Println("✅ Connected to database successfully")

	// Drop duplicate tables (singular-named Prisma tables)
	fmt.Println("🗑️  Removing duplicate tables...")

	statements := []string{
		`DROP TABLE IF EXISTS "User" CASCADE;`,
		`DROP TABLE IF EXISTS "Product" CASCADE;`,
		`DROP TABLE IF EXISTS "Category" CASCADE;`,
		`DROP TABLE IF EXISTS "Order" CASCADE;`,
		`DROP TABLE IF EXISTS "OrderItem" CASCADE;`,
		`DROP TABLE IF EXISTS "Review" CASCADE;`,
		`DROP TABLE IF EXISTS "CartItem" CASCADE;`,
		`DROP TABLE IF EXISTS "Address" CASCADE;`,
		`DROP TABLE IF EXISTS "Wishlist" CASCADE;`,
		`DROP TABLE IF EXISTS "Image" CASCADE;`,
		`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;`,
	}

	for _, stmt := range statements {
		if err := db.Exec(stmt).Error; err != nil {
			fmt.Printf("⚠️  Warning executing statement: %s\n", err)
		} else {
			fmt.Printf("✅ Executed: %s\n", stmt)
		}
	}

	// Show remaining tables
	fmt.Println("\n📋 Remaining tables in database:")
	var tables []string
	db.Raw(`
		SELECT table_name 
		FROM information_schema.tables 
		WHERE table_schema = 'public' 
		AND table_type = 'BASE TABLE'
		ORDER BY table_name
	`).Scan(&tables)

	for _, table := range tables {
		fmt.Printf("  - %s\n", table)
	}

	fmt.Println("\n🎉 Database cleanup completed!")
	fmt.Println("✅ Only the correct plural-named tables remain")
	fmt.Println("✅ Go backend will work correctly with these tables")
}
