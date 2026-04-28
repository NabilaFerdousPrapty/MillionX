// hooks/useEmergencyData.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface EmergencyFacility {
  name: string;
  type: string;
  lat: number;
  lon: number;
  contact: string;
  address?: string;
  capacity?: string | number;
  distance?: number;
  division?: string;
  district?: string;
  beds?: number;
}

interface EmergencyAlert {
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  timestamp: string;
}

interface DistrictContacts {
  police?: string;
  fire?: string;
  ambulance?: string;
  general?: string;
}

interface EmergencyData {
  userLocation?: { lat: number; lon: number };
  userDistrict?: { division: string; district: string };
  nearestFacilities: EmergencyFacility[];
  districtEmergencyContacts?: DistrictContacts;
  allFacilities?: EmergencyFacility[];
}

interface EmergencyDataResponse {
  success: boolean;
  data: EmergencyData;
  message: string;
}

export function useEmergencyData(lat?: number, lon?: number) {
  const [data, setData] = useState<EmergencyData | null>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch main emergency data
  const fetchEmergencyData = useCallback(
    async (latitude: number, longitude: number) => {
      if (!latitude || !longitude) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/emergency-data?lat=${latitude}&lon=${longitude}&type=all`,
        );

        if (!response.ok) {
          throw new Error("Server response failed");
        }

        const result: EmergencyDataResponse = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || "ডাটা লোড করতে সমস্যা হয়েছে");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("নেটওয়ার্ক সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 🔹 Fetch alerts
  const fetchEmergencyAlerts = useCallback(
    async (latitude: number, longitude: number) => {
      if (!latitude || !longitude) return;

      try {
        const response = await fetch("/api/emergency-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: latitude,
            lon: longitude,
            alertType: "all",
          }),
        });

        if (!response.ok) return;

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setAlerts(result.data);
        }
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    },
    [],
  );

  // 🔹 Filter facilities
  const getFacilitiesByType = useCallback(
    (type: "facilities" | "shelters" | "hospitals") => {
      if (!data?.nearestFacilities) return [];

      const typeMap: Record<string, string[]> = {
        facilities: ["জেলা প্রশাসক", "government"],
        shelters: ["সাইক্লোন", "shelter"],
        hospitals: ["হাসপাতাল", "hospital"],
      };

      return data.nearestFacilities.filter((facility) =>
        typeMap[type].some((t) =>
          facility.type?.toLowerCase().includes(t.toLowerCase()),
        ),
      );
    },
    [data],
  );

  // 🔹 Auto fetch when lat/lon changes
  useEffect(() => {
    if (!lat || !lon) return;

    fetchEmergencyData(lat, lon);
    fetchEmergencyAlerts(lat, lon);
  }, [lat, lon, fetchEmergencyData, fetchEmergencyAlerts]);

  return {
    data,
    alerts,
    loading,
    error,
    getFacilitiesByType,
    refetch: () => {
      if (lat && lon) fetchEmergencyData(lat, lon);
    },
  };
}
