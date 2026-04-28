// utils/bangladeshEmergencyUtils.ts
"use client";

export interface EmergencyService {
  name: string;
  type: string;
  contact: string;
  address: string;
  lat: number;
  lon: number;
  division: string;
  district: string;
  upazila?: string;
  capacity?: string | number;
}

// Simplified emergency data that doesn't rely on the API route
export const bangladeshDistricts = {
  divisions: {
    ঢাকা: {
      districts: [
        "ঢাকা",
        "গাজীপুর",
        "নারায়ণগঞ্জ",
        "মানিকগঞ্জ",
        "মুন্সীগঞ্জ",
        "নরসিংদী",
        "টাঙ্গাইল",
        "কিশোরগঞ্জ",
        "ময়মনসিংহ",
        "শেরপুর",
        "জামালপুর",
        "নেত্রকোণা",
      ],
      emergencyContacts: {
        controlRoom: "02-55165118",
        disasterManagement: "02-55165119",
      },
    },
    চট্টগ্রাম: {
      districts: [
        "চট্টগ্রাম",
        "কক্সবাজার",
        "রাঙ্গামাটি",
        "খাগড়াছড়ি",
        "বান্দরবান",
        "ফেনী",
        "কুমিল্লা",
        "নোয়াখালী",
        "লক্ষ্মীপুর",
        "চাঁদপুর",
        "ব্রাহ্মণবাড়িয়া",
      ],
      emergencyContacts: {
        controlRoom: "031-614772",
        disasterManagement: "031-614773",
      },
    },
    রাজশাহী: {
      districts: [
        "রাজশাহী",
        "নওগাঁ",
        "নাটোর",
        "চাঁপাইনবাবগঞ্জ",
        "পাবনা",
        "সিরাজগঞ্জ",
        "বগুড়া",
        "জয়পুরহাট",
      ],
      emergencyContacts: {
        controlRoom: "0721-773400",
        disasterManagement: "0721-773401",
      },
    },
    খুলনা: {
      districts: [
        "খুলনা",
        "যশোর",
        "সাতক্ষীরা",
        "বাগেরহাট",
        "নড়াইল",
        "মাগুরা",
        "ঝিনাইদহ",
        "কুষ্টিয়া",
        "চুয়াডাঙ্গা",
        "মেহেরপুর",
      ],
      emergencyContacts: {
        controlRoom: "041-724191",
        disasterManagement: "041-724192",
      },
    },
    বরিশাল: {
      districts: [
        "বরিশাল",
        "পটুয়াখালী",
        "ভোলা",
        "বরগুনা",
        "ঝালকাঠি",
        "পিরোজপুর",
      ],
      emergencyContacts: {
        controlRoom: "0431-63706",
        disasterManagement: "0431-63707",
      },
    },
    সিলেট: {
      districts: ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
      emergencyContacts: {
        controlRoom: "0821-710112",
        disasterManagement: "0821-710113",
      },
    },
    রংপুর: {
      districts: [
        "রংপুর",
        "দিনাজপুর",
        "কুড়িগ্রাম",
        "গাইবান্ধা",
        "লালমনিরহাট",
        "নীলফামারী",
        "পঞ্চগড়",
        "ঠাকুরগাঁও",
      ],
      emergencyContacts: {
        controlRoom: "0521-52323",
        disasterManagement: "0521-52324",
      },
    },
  },

  // Emergency facilities across Bangladesh
  emergencyFacilities: [
    // Dhaka facilities
    {
      name: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
      type: "হাসপাতাল",
      lat: 23.7289,
      lon: 90.3944,
      contact: "02-55165001",
      address: "বকশীবাজার, ঢাকা",
      capacity: "২৩০০ বেড",
      division: "ঢাকা",
      district: "ঢাকা",
    },
    {
      name: "মিরপুর সাইক্লোন শেল্টার",
      type: "সাইক্লোন শেল্টার",
      lat: 23.8065,
      lon: 90.3681,
      contact: "01711-223344",
      address: "মিরপুর, ঢাকা",
      capacity: "৫০০ জন",
      division: "ঢাকা",
      district: "ঢাকা",
    },
    {
      name: "উত্তরা সাইক্লোন শেল্টার",
      type: "সাইক্লোন শেল্টার",
      lat: 23.8761,
      lon: 90.3769,
      contact: "01712-334455",
      address: "উত্তরা, ঢাকা",
      capacity: "৮০০ জন",
      division: "ঢাকা",
      district: "ঢাকা",
    },
    {
      name: "গাজীপুর জেলা হাসপাতাল",
      type: "হাসপাতাল",
      lat: 23.9982,
      lon: 90.4237,
      contact: "02-9264450",
      address: "গাজীপুর সদর, গাজীপুর",
      capacity: "২৫০ বেড",
      division: "ঢাকা",
      district: "গাজীপুর",
    },

    // Chittagong facilities
    {
      name: "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল",
      type: "হাসপাতাল",
      lat: 22.3495,
      lon: 91.8367,
      contact: "031-619441",
      address: "নাসিরাবাদ, চট্টগ্রাম",
      capacity: "২৫০০ বেড",
      division: "চট্টগ্রাম",
      district: "চট্টগ্রাম",
    },
    {
      name: "কাট্টলী সাইক্লোন শেল্টার",
      type: "সাইক্লোন শেল্টার",
      lat: 22.4015,
      lon: 91.7995,
      contact: "01812-345678",
      address: "কাট্টলী, চট্টগ্রাম",
      capacity: "১০০০ জন",
      division: "চট্টগ্রাম",
      district: "চট্টগ্রাম",
    },
    {
      name: "কক্সবাজার সদর হাসপাতাল",
      type: "হাসপাতাল",
      lat: 21.4272,
      lon: 91.9708,
      contact: "0341-62550",
      address: "কক্সবাজার সদর",
      capacity: "২৫০ বেড",
      division: "চট্টগ্রাম",
      district: "কক্সবাজার",
    },
    {
      name: "টেকনাফ সাইক্লোন শেল্টার",
      type: "সাইক্লোন শেল্টার",
      lat: 20.8654,
      lon: 92.2979,
      contact: "01816-789012",
      address: "টেকনাফ, কক্সবাজার",
      capacity: "৭০০ জন",
      division: "চট্টগ্রাম",
      district: "কক্সবাজার",
    },

    // Rajshahi facilities
    {
      name: "রাজশাহী মেডিকেল কলেজ হাসপাতাল",
      type: "হাসপাতাল",
      lat: 24.3759,
      lon: 88.6032,
      contact: "0721-775150",
      address: "রাজশাহী",
      capacity: "১৫০০ বেড",
      division: "রাজশাহী",
      district: "রাজশাহী",
    },

    // Khulna facilities
    {
      name: "খুলনা মেডিকেল কলেজ হাসপাতাল",
      type: "হাসপাতাল",
      lat: 22.8456,
      lon: 89.5403,
      contact: "041-724195",
      address: "খুলনা",
      capacity: "১০০০ বেড",
      division: "খুলনা",
      district: "খুলনা",
    },
    {
      name: "দাকোপ সাইক্লোন শেল্টার",
      type: "সাইক্লোন শেল্টার",
      lat: 22.4335,
      lon: 89.5112,
      contact: "01819-012345",
      address: "দাকোপ, খুলনা",
      capacity: "৭০০ জন",
      division: "খুলনা",
      district: "খুলনা",
    },

    // Barisal facilities
    {
      name: "বরিশাল শের-ই-বাংলা মেডিকেল কলেজ",
      type: "হাসপাতাল",
      lat: 22.701,
      lon: 90.3535,
      contact: "0431-63720",
      address: "বরিশাল",
      capacity: "১০০০ বেড",
      division: "বরিশাল",
      district: "বরিশাল",
    },

    // Sylhet facilities
    {
      name: "সিলেট এম এ জি ওসমানী মেডিকেল কলেজ",
      type: "হাসপাতাল",
      lat: 24.8949,
      lon: 91.8687,
      contact: "0821-715656",
      address: "সিলেট",
      capacity: "১৫০০ বেড",
      division: "সিলেট",
      district: "সিলেট",
    },

    // Rangpur facilities
    {
      name: "রংপুর মেডিকেল কলেজ হাসপাতাল",
      type: "হাসপাতাল",
      lat: 25.7492,
      lon: 89.2472,
      contact: "0521-52330",
      address: "রংপুর",
      capacity: "১০০০ বেড",
      division: "রংপুর",
      district: "রংপুর",
    },
  ],
};

export class BangladeshEmergencyUtils {
  // Get all divisions
  static getAllDivisions(): string[] {
    return Object.keys(bangladeshDistricts.divisions);
  }

  // Get all districts in a division
  static getDistrictsByDivision(division: string): string[] {
    const divisionData =
      bangladeshDistricts.divisions[
        division as keyof typeof bangladeshDistricts.divisions
      ];
    return divisionData ? divisionData.districts : [];
  }

  // Get emergency contacts for a specific district
  static getDistrictEmergencyContacts(division: string, district: string) {
    const divisionData =
      bangladeshDistricts.divisions[
        division as keyof typeof bangladeshDistricts.divisions
      ];
    return {
      ...divisionData?.emergencyContacts,
      districtName: district,
      nationalEmergency: "999",
      ambulance: "106",
      fireService: "16163",
    };
  }

  // Get all facilities in a district
  static getDistrictFacilities(
    division: string,
    district: string,
  ): EmergencyService[] {
    return bangladeshDistricts.emergencyFacilities.filter(
      (facility) =>
        facility.division === division && facility.district === district,
    );
  }

  // Calculate distance between two coordinates
  static calculateDistance(
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

  // Format distance for display
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} মিটার`;
    }
    return `${distance.toFixed(1)} কিমি`;
  }

  // Find nearest facilities based on user location
  static findNearestFacilities(
    lat: number,
    lon: number,
    limit: number = 5,
  ): EmergencyService[] {
    const facilitiesWithDistance = bangladeshDistricts.emergencyFacilities.map(
      (facility) => ({
        ...facility,
        distance: this.calculateDistance(lat, lon, facility.lat, facility.lon),
        distanceText: this.formatDistance(
          this.calculateDistance(lat, lon, facility.lat, facility.lon),
        ),
      }),
    );

    return facilitiesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  // Get flood-prone districts
  static getFloodProneDistricts(): string[] {
    return [
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
      "শরীয়তপুর",
      "মাদারীপুর",
      "গোপালগঞ্জ",
      "ফরিদপুর",
      "রাজবাড়ী",
    ];
  }

  // Get cyclone-prone districts
  static getCycloneProneDistricts(): string[] {
    return [
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
  }

  // Get emergency preparedness tips based on district
  static getPreparednessTips(district: string): string[] {
    const tips = [
      "জরুরি নম্বরগুলো হাতে রাখুন",
      "শুকনো খাবার ও বিশুদ্ধ পানি মজুত করুন",
      "প্রাথমিক চিকিৎসা বক্স রাখুন",
      "গুরুত্বপূর্ণ দলিলপত্র প্লাস্টিকের ব্যাগে সংরক্ষণ করুন",
    ];

    const floodProne = this.getFloodProneDistricts();
    const cycloneProne = this.getCycloneProneDistricts();

    if (floodProne.includes(district)) {
      tips.push("উঁচু স্থানে চলে যাওয়ার প্রস্তুতি রাখুন");
      tips.push("জরুরি নৌকা বা ভেলা তৈরি করুন");
    }

    if (cycloneProne.includes(district)) {
      tips.push("মজবুত ভবনে আশ্রয় নিন");
      tips.push("গাছ ও বিদ্যুতের খুঁটি থেকে দূরে থাকুন");
      tips.push("সাইক্লোন শেল্টারের অবস্থান জেনে রাখুন");
    }

    return tips;
  }
}
