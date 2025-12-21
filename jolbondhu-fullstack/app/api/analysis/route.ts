import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district");

  try {
    // Next.js talks to Python
    const response = await fetch(
      `http://127.0.0.1:8000/analysis/trends?district=${district}`
    );
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
