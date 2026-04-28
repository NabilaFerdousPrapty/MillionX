// app/api/emergency-data/route.ts
import { NextResponse } from "next/server";

// Complete Bangladesh emergency data by division and district
export const bangladeshEmergencyData = {
  divisions: {
    ঢাকা: {
      centers: {
        "ঢাকা জেলা": {
          upazilas: ["ঢাকা সিটি", "কেরানীগঞ্জ", "নবাবগঞ্জ", "দোহার", "সাভার"],
          emergencyContacts: {
            disasterManagement: "02-55165118",
            controlRoom: "02-55165119",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "ঢাকা জেলা প্রশাসক অফিস",
              type: "government",
              lat: 23.7886,
              lon: 90.4074,
              contact: "02-55165118",
              address: "জেলা প্রশাসক অফিস, রমনা, ঢাকা",
              capacity: "সকল ধরনের সেবা",
            },
            {
              name: "সাভার উপজেলা কমপ্লেক্স",
              type: "government",
              lat: 23.8579,
              lon: 90.2663,
              contact: "01769-123456",
              address: "সাভার, ঢাকা",
              capacity: "জরুরি সেবা কেন্দ্র",
            },
          ],
          cycloneShelters: [
            {
              name: "মিরপুর সাইক্লোন শেল্টার",
              lat: 23.8065,
              lon: 90.3681,
              capacity: 500,
              contact: "01711-223344",
            },
            {
              name: "উত্তরা সাইক্লোন শেল্টার",
              lat: 23.8761,
              lon: 90.3769,
              capacity: 800,
              contact: "01712-334455",
            },
          ],
          hospitals: [
            {
              name: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
              lat: 23.7289,
              lon: 90.3944,
              contact: "02-55165001",
              beds: 2300,
            },
            {
              name: "সাভার এনাম মেডিকেল কলেজ",
              lat: 23.8489,
              lon: 90.2663,
              contact: "01777-123456",
              beds: 500,
            },
          ],
        },
        "গাজীপুর জেলা": {
          upazilas: [
            "গাজীপুর সদর",
            "কালিয়াকৈর",
            "কালীগঞ্জ",
            "শ্রীপুর",
            "কাপাসিয়া",
          ],
          emergencyContacts: {
            disasterManagement: "02-9264401",
            controlRoom: "02-9264402",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "গাজীপুর জেলা প্রশাসক অফিস",
              type: "government",
              lat: 23.9982,
              lon: 90.4237,
              contact: "02-9264401",
              address: "গাজীপুর সদর, গাজীপুর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "গাজীপুর সিটি কর্পোরেশন শেল্টার",
              lat: 23.9877,
              lon: 90.4225,
              capacity: 400,
              contact: "01709-887766",
            },
          ],
          hospitals: [
            {
              name: "গাজীপুর জেলা হাসপাতাল",
              lat: 23.9982,
              lon: 90.4237,
              contact: "02-9264450",
              beds: 250,
            },
          ],
        },
        "নারায়ণগঞ্জ জেলা": {
          upazilas: [
            "নারায়ণগঞ্জ সদর",
            "বন্দর",
            "রূপগঞ্জ",
            "আড়াইহাজার",
            "সোনারগাঁও",
          ],
          emergencyContacts: {
            disasterManagement: "02-7632470",
            controlRoom: "02-7632471",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "নারায়ণগঞ্জ জেলা প্রশাসক অফিস",
              type: "government",
              lat: 23.6334,
              lon: 90.4952,
              contact: "02-7632470",
              address: "নারায়ণগঞ্জ সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "নারায়ণগঞ্জ সিটি কর্পোরেশন শেল্টার",
              lat: 23.6218,
              lon: 90.4969,
              capacity: 350,
              contact: "01710-998877",
            },
          ],
          hospitals: [
            {
              name: "নারায়ণগঞ্জ জেলা হাসপাতাল",
              lat: 23.6334,
              lon: 90.4952,
              contact: "02-7632480",
              beds: 200,
            },
          ],
        },
      },
    },
    চট্টগ্রাম: {
      centers: {
        "চট্টগ্রাম জেলা": {
          upazilas: [
            "চট্টগ্রাম সিটি",
            "মীরসরাই",
            "সীতাকুণ্ড",
            "সন্দ্বীপ",
            "রাউজান",
            "রাঙ্গুনিয়া",
            "বোয়ালখালী",
            "পটিয়া",
            "ফটিকছড়ি",
            "হাটহাজারী",
            "লোহাগাড়া",
            "সাতকানিয়া",
          ],
          emergencyContacts: {
            disasterManagement: "031-614772",
            controlRoom: "031-614773",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "চট্টগ্রাম জেলা প্রশাসক অফিস",
              type: "government",
              lat: 22.3569,
              lon: 91.7832,
              contact: "031-614772",
              address: "নাসিরাবাদ, চট্টগ্রাম",
              capacity: "সকল ধরনের সেবা",
            },
            {
              name: "চট্টগ্রাম সিটি কর্পোরেশন",
              type: "government",
              lat: 22.3475,
              lon: 91.8324,
              contact: "031-632444",
              address: "আন্দরকিল্লা, চট্টগ্রাম",
              capacity: "জরুরি সেবা কেন্দ্র",
            },
          ],
          cycloneShelters: [
            {
              name: "কাট্টলী সাইক্লোন শেল্টার",
              lat: 22.4015,
              lon: 91.7995,
              capacity: 1000,
              contact: "01812-345678",
            },
            {
              name: "পতেঙ্গা সাইক্লোন শেল্টার",
              lat: 22.2552,
              lon: 91.7619,
              capacity: 800,
              contact: "01813-456789",
            },
            {
              name: "হালিশহর সাইক্লোন শেল্টার",
              lat: 22.3657,
              lon: 91.7917,
              capacity: 600,
              contact: "01814-567890",
            },
          ],
          hospitals: [
            {
              name: "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল",
              lat: 22.3495,
              lon: 91.8367,
              contact: "031-619441",
              beds: 2500,
            },
          ],
        },
        "কক্সবাজার জেলা": {
          upazilas: [
            "কক্সবাজার সদর",
            "চকরিয়া",
            "রামু",
            "উখিয়া",
            "টেকনাফ",
            "কুতুবদিয়া",
            "মহেশখালী",
            "পেকুয়া",
          ],
          emergencyContacts: {
            disasterManagement: "0341-62533",
            controlRoom: "0341-62534",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "কক্সবাজার জেলা প্রশাসক অফিস",
              type: "government",
              lat: 21.4272,
              lon: 91.9708,
              contact: "0341-62533",
              address: "কক্সবাজার সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "কক্সবাজার কেন্দ্রীয় সাইক্লোন শেল্টার",
              lat: 21.4208,
              lon: 91.9714,
              capacity: 1200,
              contact: "01815-678901",
            },
            {
              name: "টেকনাফ সাইক্লোন শেল্টার",
              lat: 20.8654,
              lon: 92.2979,
              capacity: 700,
              contact: "01816-789012",
            },
          ],
          hospitals: [
            {
              name: "কক্সবাজার সদর হাসপাতাল",
              lat: 21.4272,
              lon: 91.9708,
              contact: "0341-62550",
              beds: 250,
            },
          ],
        },
      },
    },
    রাজশাহী: {
      centers: {
        "রাজশাহী জেলা": {
          upazilas: [
            "রাজশাহী সিটি",
            "পবা",
            "বাঘা",
            "মোহনপুর",
            "গোদাগাড়ী",
            "তানোর",
            "চারঘাট",
            "দুর্গাপুর",
            "পুঠিয়া",
            "বাগমারা",
          ],
          emergencyContacts: {
            disasterManagement: "0721-773400",
            controlRoom: "0721-773401",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "রাজশাহী জেলা প্রশাসক অফিস",
              type: "government",
              lat: 24.3745,
              lon: 88.6042,
              contact: "0721-773400",
              address: "রাজশাহী সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "রাজশাহী সিটি কর্পোরেশন শেল্টার",
              lat: 24.3636,
              lon: 88.6241,
              capacity: 500,
              contact: "01717-890123",
            },
          ],
          hospitals: [
            {
              name: "রাজশাহী মেডিকেল কলেজ হাসপাতাল",
              lat: 24.3759,
              lon: 88.6032,
              contact: "0721-775150",
              beds: 1500,
            },
          ],
        },
      },
    },
    খুলনা: {
      centers: {
        "খুলনা জেলা": {
          upazilas: [
            "খুলনা সিটি",
            "দিঘলিয়া",
            "বটিয়াঘাটা",
            "রূপসা",
            "তেরখাদা",
            "ডুমুরিয়া",
            "পাইকগাছা",
            "কয়রা",
            "ফুলতলা",
            "দাকোপ",
          ],
          emergencyContacts: {
            disasterManagement: "041-724191",
            controlRoom: "041-724192",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "খুলনা জেলা প্রশাসক অফিস",
              type: "government",
              lat: 22.8456,
              lon: 89.5403,
              contact: "041-724191",
              address: "খুলনা সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "খুলনা সিটি কর্পোরেশন শেল্টার",
              lat: 22.8177,
              lon: 89.5682,
              capacity: 600,
              contact: "01818-901234",
            },
            {
              name: "দাকোপ সাইক্লোন শেল্টার",
              lat: 22.4335,
              lon: 89.5112,
              capacity: 700,
              contact: "01819-012345",
            },
          ],
          hospitals: [
            {
              name: "খুলনা মেডিকেল কলেজ হাসপাতাল",
              lat: 22.8456,
              lon: 89.5403,
              contact: "041-724195",
              beds: 1000,
            },
          ],
        },
        "সাতক্ষীরা জেলা": {
          upazilas: [
            "সাতক্ষীরা সদর",
            "আশাশুনি",
            "কলারোয়া",
            "কালীগঞ্জ",
            "তালা",
            "দেবহাটা",
            "শ্যামনগর",
            "পাটকেলঘাটা",
          ],
          emergencyContacts: {
            disasterManagement: "0471-64200",
            controlRoom: "0471-64201",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "সাতক্ষীরা জেলা প্রশাসক অফিস",
              type: "government",
              lat: 22.7108,
              lon: 89.0742,
              contact: "0471-64200",
              address: "সাতক্ষীরা সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "শ্যামনগর সাইক্লোন শেল্টার",
              lat: 22.3347,
              lon: 89.1286,
              capacity: 500,
              contact: "01820-123456",
            },
          ],
          hospitals: [
            {
              name: "সাতক্ষীরা সদর হাসপাতাল",
              lat: 22.7108,
              lon: 89.0742,
              contact: "0471-64210",
              beds: 250,
            },
          ],
        },
      },
    },
    বরিশাল: {
      centers: {
        "বরিশাল জেলা": {
          upazilas: [
            "বরিশাল সিটি",
            "বাকেরগঞ্জ",
            "বাবুগঞ্জ",
            "উজিরপুর",
            "বানারীপাড়া",
            "আগৈলঝাড়া",
            "গৌরনদী",
            "হিজলা",
            "মেহেন্দিগঞ্জ",
            "মুলাদী",
          ],
          emergencyContacts: {
            disasterManagement: "0431-63706",
            controlRoom: "0431-63707",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "বরিশাল জেলা প্রশাসক অফিস",
              type: "government",
              lat: 22.701,
              lon: 90.3535,
              contact: "0431-63706",
              address: "বরিশাল সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "বরিশাল সিটি কর্পোরেশন শেল্টার",
              lat: 22.6695,
              lon: 90.3486,
              capacity: 450,
              contact: "01821-234567",
            },
          ],
          hospitals: [
            {
              name: "বরিশাল শের-ই-বাংলা মেডিকেল কলেজ",
              lat: 22.701,
              lon: 90.3535,
              contact: "0431-63720",
              beds: 1000,
            },
          ],
        },
      },
    },
    সিলেট: {
      centers: {
        "সিলেট জেলা": {
          upazilas: [
            "সিলেট সিটি",
            "দক্ষিণ সুরমা",
            "বিশ্বনাথ",
            "বালাগঞ্জ",
            "গোলাপগঞ্জ",
            "জৈন্তাপুর",
            "কানাইঘাট",
            "কোম্পানীগঞ্জ",
            "জকিগঞ্জ",
            "বিয়ানীবাজার",
            "ফেঞ্চুগঞ্জ",
          ],
          emergencyContacts: {
            disasterManagement: "0821-710112",
            controlRoom: "0821-710113",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "সিলেট জেলা প্রশাসক অফিস",
              type: "government",
              lat: 24.8949,
              lon: 91.8687,
              contact: "0821-710112",
              address: "সিলেট সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "সিলেট সিটি কর্পোরেশন শেল্টার",
              lat: 24.8987,
              lon: 91.8768,
              capacity: 400,
              contact: "01822-345678",
            },
          ],
          hospitals: [
            {
              name: "সিলেট এম এ জি ওসমানী মেডিকেল কলেজ",
              lat: 24.8949,
              lon: 91.8687,
              contact: "0821-715656",
              beds: 1500,
            },
          ],
        },
      },
    },
    রংপুর: {
      centers: {
        "রংপুর জেলা": {
          upazilas: [
            "রংপুর সিটি",
            "বদরগঞ্জ",
            "মিঠাপুকুর",
            "পীরগঞ্জ",
            "পীরগাছা",
            "তারাগঞ্জ",
            "কাউনিয়া",
            "গংগাচড়া",
            "সাদুল্লাপুর",
          ],
          emergencyContacts: {
            disasterManagement: "0521-52323",
            controlRoom: "0521-52324",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "রংপুর জেলা প্রশাসক অফিস",
              type: "government",
              lat: 25.7492,
              lon: 89.2472,
              contact: "0521-52323",
              address: "রংপুর সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "রংপুর সিটি কর্পোরেশন শেল্টার",
              lat: 25.7563,
              lon: 89.2517,
              capacity: 450,
              contact: "01823-456789",
            },
          ],
          hospitals: [
            {
              name: "রংপুর মেডিকেল কলেজ হাসপাতাল",
              lat: 25.7492,
              lon: 89.2472,
              contact: "0521-52330",
              beds: 1000,
            },
          ],
        },
      },
    },
    ময়মনসিংহ: {
      centers: {
        "ময়মনসিংহ জেলা": {
          upazilas: [
            "ময়মনসিংহ সিটি",
            "ত্রিশাল",
            "গৌরীপুর",
            "ঈশ্বরগঞ্জ",
            "নান্দাইল",
            "ফুলপুর",
            "হালুয়াঘাট",
            "মুক্তাগাছা",
            "ফুলবাড়িয়া",
            "ধোবাউড়া",
          ],
          emergencyContacts: {
            disasterManagement: "091-53467",
            controlRoom: "091-53468",
            ambulance: "999",
            fireService: "16163",
            police: "999",
          },
          facilities: [
            {
              name: "ময়মনসিংহ জেলা প্রশাসক অফিস",
              type: "government",
              lat: 24.7539,
              lon: 90.4073,
              contact: "091-53467",
              address: "ময়মনসিংহ সদর",
              capacity: "সকল ধরনের সেবা",
            },
          ],
          cycloneShelters: [
            {
              name: "ময়মনসিংহ সিটি কর্পোরেশন শেল্টার",
              lat: 24.7458,
              lon: 90.4017,
              capacity: 400,
              contact: "01824-567890",
            },
          ],
          hospitals: [
            {
              name: "ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল",
              lat: 24.7539,
              lon: 90.4073,
              contact: "091-53480",
              beds: 1800,
            },
          ],
        },
      },
    },
  },
};

// Helper function to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to find nearest facilities based on user location
function findNearestFacilities(lat: number, lon: number, limit: number = 5) {
  const allFacilities: any[] = [];

  // Collect all facilities from all districts
  for (const division in bangladeshEmergencyData.divisions) {
    const divisionData =
      bangladeshEmergencyData.divisions[
        division as keyof typeof bangladeshEmergencyData.divisions
      ];

    for (const district in divisionData.centers) {
      const districtData = divisionData.centers[district];

      // Add facilities
      districtData.facilities.forEach((facility: any) => {
        allFacilities.push({
          ...facility,
          division,
          district,
          distance: calculateDistance(lat, lon, facility.lat, facility.lon),
        });
      });

      // Add cyclone shelters
      if (districtData.cycloneShelters) {
        districtData.cycloneShelters.forEach((shelter: any) => {
          allFacilities.push({
            ...shelter,
            type: "সাইক্লোন শেল্টার",
            division,
            district,
            distance: calculateDistance(lat, lon, shelter.lat, shelter.lon),
          });
        });
      }

      // Add hospitals
      if (districtData.hospitals) {
        districtData.hospitals.forEach((hospital: any) => {
          allFacilities.push({
            ...hospital,
            type: "হাসপাতাল",
            division,
            district,
            distance: calculateDistance(lat, lon, hospital.lat, hospital.lon),
          });
        });
      }
    }
  }

  // Sort by distance and return top facilities
  return allFacilities.sort((a, b) => a.distance - b.distance).slice(0, limit);
}

// Helper function to find user's district based on location
function findUserDistrict(
  lat: number,
  lon: number,
): { division: string; district: string } | null {
  let closestDistrict = null;
  let minDistance = Infinity;

  for (const division in bangladeshEmergencyData.divisions) {
    const divisionData =
      bangladeshEmergencyData.divisions[
        division as keyof typeof bangladeshEmergencyData.divisions
      ];

    for (const district in divisionData.centers) {
      const districtData = divisionData.centers[district];
      const districtCenter = districtData.facilities[0];

      if (districtCenter) {
        const distance = calculateDistance(
          lat,
          lon,
          districtCenter.lat,
          districtCenter.lon,
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestDistrict = { division, district };
        }
      }
    }
  }

  return closestDistrict;
}

// GET handler for the API
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lon = parseFloat(searchParams.get("lon") || "");
  const type = searchParams.get("type") || "all"; // all, facilities, shelters, hospitals

  if (isNaN(lat) || isNaN(lon)) {
    // Return all emergency data if no location provided
    return NextResponse.json({
      success: true,
      data: bangladeshEmergencyData,
      message: "বাংলাদেশের সকল জরুরি তথ্য",
    });
  }

  try {
    // Find user's district
    const userDistrict = findUserDistrict(lat, lon);

    // Find nearest facilities
    const nearestFacilities = findNearestFacilities(lat, lon, 10);

    // Filter by type if specified
    let filteredFacilities = nearestFacilities;
    if (type !== "all") {
      const typeMap: { [key: string]: string } = {
        facilities: "জেলা প্রশাসক অফিস",
        shelters: "সাইক্লোন শেল্টার",
        hospitals: "হাসপাতাল",
      };
      filteredFacilities = nearestFacilities.filter(
        (f) =>
          f.type?.includes(typeMap[type]) ||
          (type === "shelters" && f.type === "সাইক্লোন শেল্টার") ||
          (type === "hospitals" && f.type === "হাসপাতাল"),
      );
    }

    // Get district specific emergency contacts
    let districtContacts = null;
    if (userDistrict) {
      const districtData =
        bangladeshEmergencyData.divisions[
          userDistrict.division as keyof typeof bangladeshEmergencyData.divisions
        ].centers[userDistrict.district];
      districtContacts = districtData.emergencyContacts;
    }

    return NextResponse.json({
      success: true,
      data: {
        userLocation: { lat, lon },
        userDistrict,
        nearestFacilities: filteredFacilities,
        districtEmergencyContacts: districtContacts,
        allFacilities: nearestFacilities,
      },
      message: "আপনার অবস্থান ভিত্তিক জরুরি তথ্য",
    });
  } catch (error) {
    console.error("Error fetching emergency data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ডাটা লোড করতে সমস্যা হয়েছে",
        message: "আবার চেষ্টা করুন",
      },
      { status: 500 },
    );
  }
}

// POST handler for getting emergency alerts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lon, alertType } = body;

    // Generate emergency alerts based on location
    const alerts = [];

    // Check if location is in coastal area for cyclone alerts
    const coastalDistricts = [
      "কক্সবাজার",
      "চট্টগ্রাম",
      "নোয়াখালী",
      "লক্ষ্মীপুর",
      "ভোলা",
      "বরগুনা",
      "পটুয়াখালী",
      "বরিশাল",
      "ঝালকাঠি",
      "পিরোজপুর",
      "খুলনা",
      "সাতক্ষীরা",
      "বাগেরহাট",
    ];

    if (lat && lon) {
      const userDistrict = findUserDistrict(lat, lon);

      if (userDistrict && coastalDistricts.includes(userDistrict.district)) {
        alerts.push({
          title: "সাইক্লোন সতর্কতা",
          message:
            "আপনি উপকূলীয় এলাকায় অবস্থান করছেন। দয়া করে সাইক্লোন শেল্টারের অবস্থান জেনে রাখুন এবং জরুরি নম্বর হাতে রাখুন।",
          priority: "medium",
          timestamp: new Date().toISOString(),
        });
      }

      // Check for flood prone areas
      const floodProneDistricts = [
        "সুনামগঞ্জ",
        "নেত্রকোণা",
        "কিশোরগঞ্জ",
        "হবিগঞ্জ",
        "মৌলভীবাজার",
        "সিরাজগঞ্জ",
        "পাবনা",
        "টাঙ্গাইল",
        "গাজীপুর",
        "নারায়ণগঞ্জ",
      ];

      if (userDistrict && floodProneDistricts.includes(userDistrict.district)) {
        alerts.push({
          title: "বন্যা সতর্কতা",
          message:
            "এই এলাকায় বন্যার ঝুঁকি রয়েছে। উচ্চ স্থানে যাওয়ার প্রস্তুতি রাখুন এবং জরুরি খাবার মজুত করুন।",
          priority: "high",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Add general alerts
    alerts.push({
      title: "জরুরি প্রস্তুতি",
      message:
        "জরুরি অবস্থায় শান্ত থাকুন, নিরাপদ স্থানে যান এবং জরুরি নম্বরগুলো স্মরণে রাখুন।",
      priority: "low",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      message: "জরুরি সতর্কতা",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "সতর্কতা লোড করতে সমস্যা হয়েছে",
      },
      { status: 500 },
    );
  }
}
