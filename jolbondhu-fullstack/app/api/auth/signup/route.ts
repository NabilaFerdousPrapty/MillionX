import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      district,
      upazila,
      password,
      farmerType,
      landSize,
      mainCrops,
    } = body;

    // Validate required fields
    if (!name || !phone || !district || !upazila || !password) {
      return NextResponse.json(
        { message: "সব প্রয়োজনীয় তথ্য দিন" },
        { status: 400 },
      );
    }

    // Here you would typically:
    // 1. Check if user already exists
    // 2. Hash password
    // 3. Save to database
    // 4. Generate JWT token

    // Demo - create new user (replace with actual DB operation)
    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      email: email || "",
      district,
      upazila,
      farmerType,
      landSize,
      mainCrops,
      createdAt: new Date().toISOString(),
    };

    // Set cookie for auto-login after registration
    const cookieStore = await cookies();
    cookieStore.set("isLoggedIn", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    cookieStore.set("userId", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "নিবন্ধন সফল হয়েছে",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "সার্ভার ত্রুটি ঘটেছে" },
      { status: 500 },
    );
  }
}
