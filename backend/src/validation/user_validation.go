package validation

type CreateUser struct {
	Name     string `json:"name" validate:"required,max=50" example:"fake name"`
	Email    string `json:"email" validate:"required,email,max=50" example:"fake@example.com"`
	Password string `json:"password" validate:"required,min=8,max=20,password" example:"password1"`
	Role     string `json:"role" validate:"required,oneof=user admin,max=50" example:"user"`
}

type UpdateUser struct {
	Name     string `json:"name,omitempty" validate:"omitempty,max=50" example:"fake name"`
	Email    string `json:"email" validate:"omitempty,email,max=50" example:"fake@example.com"`
	Password string `json:"password,omitempty" validate:"omitempty,min=8,max=20,password" example:"password1"`
	Phone    string `json:"phone,omitempty" validate:"omitempty,max=20" example:"0123456789"`
	Bio      string `json:"bio,omitempty" validate:"omitempty,max=120" example:"User bio"`
}

type UpdatePassOrVerify struct {
	Password      string `json:"password,omitempty" validate:"omitempty,min=8,max=20,password" example:"password1"`
	VerifiedEmail bool   `json:"verified_email" swaggerignore:"true" validate:"omitempty,boolean"`
}

type UpdatePassword struct {
	CurrentPassword string `json:"currentPassword" validate:"required,min=6,max=20" example:"oldpassword1"`
	NewPassword     string `json:"newPassword" validate:"required,min=8,max=20,password" example:"newpassword1"`
}

type QueryUser struct {
	Page   int    `validate:"omitempty,number,max=50"`
	Limit  int    `validate:"omitempty,number,max=50"`
	Search string `validate:"omitempty,max=50"`
}
