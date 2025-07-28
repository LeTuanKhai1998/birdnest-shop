package utils

import (
	"crypto/rand"
	"encoding/hex"
)

// generateID generates a random ID similar to CUID
func GenerateID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
