"use client";

import { useState, useEffect } from "react";

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  error: string | null;
  loading: boolean;
  locationName: string;
}

interface PositionError {
  POSITION_UNAVAILABLE: any;
  PERMISSION_DENIED: any;
  code: number;
  message: string;
}

export default function useLocation() {
  const [location, setLocation] = useState<Location>({
    latitude: 23.8103, // Default: Dhaka
    longitude: 90.4125,
    accuracy: null,
    timestamp: Date.now(),
    error: null,
    loading: true,
    locationName: "ঢাকা, বাংলাদেশ",
  });

  // Get city name from coordinates (Reverse Geocoding)
  const getLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=bn`
      );
      const data = await response.json();

      if (data.address) {
        const city =
          data.address.city || data.address.town || data.address.village;
        const state = data.address.state;
        const country = data.address.country;

        if (city && state) {
          return `${city}, ${state}`;
        } else if (city) {
          return city;
        } else if (state) {
          return state;
        }
        return country || "অজানা অবস্থান";
      }
    } catch (error) {
      console.error("Error getting location name:", error);
    }
    return "অজানা অবস্থান";
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "আপনার ব্রাউজার লোকেশন সার্ভিস সাপোর্ট করে না",
        loading: false,
      }));
      return;
    }

    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const locationName = await getLocationName(latitude, longitude);

      setLocation({
        latitude,
        longitude,
        accuracy,
        timestamp: position.timestamp,
        error: null,
        loading: false,
        locationName,
      });
    };

    const onError = (error: PositionError) => {
      let errorMessage = "অবস্থান পাওয়া যায়নি";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "অবস্থান এক্সেস অনুমতি দিতে হবে";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "অবস্থান তথ্য পাওয়া যাচ্ছে না";
          break;
        case error.TIMEOUT:
          errorMessage = "অবস্থান পেতে সময় নিচ্ছে";
          break;
      }

      setLocation((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    setLocation((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, []);

  // Function to manually refresh location
  const refreshLocation = () => {
    if (!navigator.geolocation) return;

    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const locationName = await getLocationName(latitude, longitude);

      setLocation({
        latitude,
        longitude,
        accuracy,
        timestamp: position.timestamp,
        error: null,
        loading: false,
        locationName,
      });
    };

    const onError = (error: PositionError) => {
      setLocation((prev) => ({
        ...prev,
        error: "রিফ্রেশ ব্যর্থ হয়েছে",
        loading: false,
      }));
    };

    setLocation((prev) => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  };

  return { location, refreshLocation };
}
