"use client";

import { useEffect } from 'react';

export default function LeafletFix() {
    useEffect(() => {
        // শুধুমাত্র ব্রাউজারে থাকলেই এই কোড চলবে
        const fixLeafletIcon = async () => {
            // ডাইনামিক ইমপোর্ট - এটি 'window is not defined' এরর সমাধান করবে
            const L = (await import("leaflet")).default;

            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });
        };

        fixLeafletIcon();
    }, []);

    return null; // এটি কোনো UI রেন্ডার করবে না, শুধু কনফিগ সেট করবে
}