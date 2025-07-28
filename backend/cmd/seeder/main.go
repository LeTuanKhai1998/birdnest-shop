package main

import (
	"app/src/config"
	"app/src/database"
	"app/src/database/seeder"
	"log"
)

func main() {
	// Initialize database
	db := database.Connect(config.DBHost, config.DBName)
	if db == nil {
		log.Fatal("Failed to connect to database")
	}

	// Create seeder instance
	seederInstance := seeder.NewSeeder(db)

	// Run seeder
	if err := seederInstance.Run(); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	log.Println("Database seeding completed successfully!")
}
