import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password, rememberMe } = body;

    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { message: "মোবাইল নম্বর এবং পাসওয়ার্ড প্রয়োজন" },
        { status: 400 },
      );
    }

    // Here you would typically:
    // 1. Validate against database
    // 2. Check password hash
    // 3. Generate JWT token

    // Demo validation (replace with actual DB check)
    if (phone === "০১৭১২৩৪৫৬৭৮" && password === "demo123") {
      const user = {
        id: "1",
        name: "মোঃ আব্দুল করিম",
        phone: phone,
        email: "karim@example.com",
        district: "সিরাজগঞ্জ",
        farmerType: "small",
      };

      // Set cookie
      const cookieStore = await cookies();
      const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day

      cookieStore.set("isLoggedIn", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: maxAge,
        path: "/",
      });

      cookieStore.set("userId", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: maxAge,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user,
        message: "লগইন সফল হয়েছে",
      });
    }

    return NextResponse.json(
      { message: "মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "সার্ভার ত্রুটি ঘটেছে" },
      { status: 500 },
    );
  }
}
