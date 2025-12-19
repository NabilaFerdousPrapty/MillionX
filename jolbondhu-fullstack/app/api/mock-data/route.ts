import { NextResponse } from "next/server";

export async function GET() {
  const mockData = {
    riskLevel: "medium",
    riskScore: 65,
    confidence: 82,
    location: {
      district: "Sirajganj",
      upazila: "Sirajganj Sadar",
      coordinates: { lat: 24.4539, lon: 89.7083 },
    },
    weather: {
      current: {
        temp: 30,
        rainfall: 45,
        humidity: 78,
        wind: 12,
      },
      forecast: [
        { day: "Today", temp: 30, rain: 45 },
        { day: "Tue", temp: 29, rain: 60 },
        { day: "Wed", temp: 28, rain: 35 },
        { day: "Thu", temp: 27, rain: 20 },
        { day: "Fri", temp: 29, rain: 15 },
      ],
    },
    crops: [
      { name: "Boro Rice", risk: "high", stage: "Transplanting" },
      { name: "Wheat", risk: "medium", stage: "Flowering" },
      { name: "Potato", risk: "low", stage: "Harvesting" },
    ],
    advisory: {
      immediate: [
        "Postpone transplanting of seedlings",
        "Secure stored grains in elevated locations",
        "Harvest mature crops if possible",
      ],
      mediumTerm: [
        "Prepare drainage channels",
        "Apply anti-stress agents",
        "Relocate livestock if needed",
      ],
    },
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(mockData);
}
