"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Navigation,
  AlertTriangle,
  Hospital,
  Home,
  Shield,
} from "lucide-react";

interface LocationMapProps {
  center: [number, number];
  userLocation?: [number, number];
  facilities: Array<{
    lat: number;
    lon: number;
    type: string;
    name: string;
    distanceText: string;
  }>;
}

const LocationMap: React.FC<LocationMapProps> = ({
  center,
  userLocation,
  facilities,
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);

  useEffect(() => {
    // Initialize map
    const mapInstance = L.map("emergency-map-container").setView(center, 13);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(mapInstance);

    setMap(mapInstance);

    // Cleanup
    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach((marker) => marker.remove());
    const newMarkers: L.Marker[] = [];

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <div class="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap">
              আপনি এখানে
            </div>
          </div>
        `,
        className: "custom-user-marker",
        iconSize: [48, 48],
        iconAnchor: [24, 48],
      });

      const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-blue-900">আপনার অবস্থান</h3>
            <p class="text-sm text-gray-600">${userLocation[0].toFixed(
              4
            )}, ${userLocation[1].toFixed(4)}</p>
          </div>
        `);
      newMarkers.push(userMarker);
    }

    // Add facility markers
    facilities.forEach((facility, index) => {
      let iconHtml = "";
      let iconColor = "";

      if (
        facility.type.includes("হাসপাতাল") ||
        facility.type.includes("স্বাস্থ্য")
      ) {
        iconHtml = `
          <div class="relative">
            <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <div class="text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap">
              ${facility.type}
            </div>
          </div>
        `;
        iconColor = "red";
      } else if (
        facility.type.includes("শেল্টার") ||
        facility.type.includes("আশ্রয়")
      ) {
        iconHtml = `
          <div class="relative">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <div class="text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap">
              ${facility.type}
            </div>
          </div>
        `;
        iconColor = "green";
      } else {
        iconHtml = `
          <div class="relative">
            <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <div class="text-white">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap">
              ${facility.type}
            </div>
          </div>
        `;
        iconColor = "orange";
      }

      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-facility-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h4 class="font-bold text-${iconColor}-900 mb-1">${facility.name}</h4>
          <p class="text-sm text-gray-600 mb-2">${facility.type}</p>
          <div class="space-y-1">
            <p class="text-xs text-gray-700"><strong>দূরত্ব:</strong> ${
              facility.distanceText
            }</p>
            <p class="text-xs text-gray-700"><strong>অবস্থান:</strong> ${facility.lat.toFixed(
              4
            )}, ${facility.lon.toFixed(4)}</p>
          </div>
        </div>
      `;

      const marker = L.marker([facility.lat, facility.lon], { icon })
        .addTo(map)
        .bindPopup(popupContent);

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (userLocation || facilities.length > 0) {
      const bounds = L.latLngBounds(
        userLocation ? [userLocation] : [],
        facilities.map((f) => [f.lat, f.lon])
      );
      map.fitBounds(bounds.pad(0.1));
    }
  }, [map, center, userLocation, facilities]);

  return (
    <div className="space-y-4">
      <div
        id="emergency-map-container"
        className="h-[400px] rounded-xl overflow-hidden border border-gray-300"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-blue-700">আপনার অবস্থান</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-700">হাসপাতাল/স্বাস্থ্য</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700">আশ্রয়কেন্দ্র</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-orange-700">অন্যান্য সুবিধা</span>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
