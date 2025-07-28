import { NextRequest, NextResponse } from "next/server";
import { authApi } from "@/lib/api-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone } = body;

    // Validate required fields
    if (!email || !password || !fullName || !phone) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Call backend registration API
    const response = await authApi.register({
      name: fullName, // Convert fullName to name for API
      email,
      password,
    });

    if (response.success) {
      return NextResponse.json(
        { message: "Registration successful" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: response.message || "Registration failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 