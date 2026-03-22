"use client";

import { getUrl } from "../utils/domains";

interface EmbedMapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  placeId?: string;
  category?: string;
  country?: string;
  dark?: boolean;
  className?: string;
  height?: string;
}

/**
 * Embeddable Africoders Map component.
 * Renders an iframe pointing to maps.africoders.com/embed with the given parameters.
 *
 * Usage:
 *   <EmbedMap lat={6.5} lng={3.4} zoom={14} />
 *   <EmbedMap placeId="some-uuid" />
 *   <EmbedMap category="hospital" country="NG" />
 */
export function EmbedMap({
  lat,
  lng,
  zoom,
  placeId,
  category,
  country,
  dark,
  className = "",
  height = "400px",
}: EmbedMapProps) {
  const mapsBase = getUrl("maps");
  const params = new URLSearchParams();
  if (lat !== undefined) params.set("lat", String(lat));
  if (lng !== undefined) params.set("lng", String(lng));
  if (zoom !== undefined) params.set("zoom", String(zoom));
  if (placeId) params.set("place", placeId);
  if (category) params.set("category", category);
  if (country) params.set("country", country);
  if (dark !== undefined) params.set("dark", dark ? "1" : "0");
  const src = `${mapsBase}/embed?${params.toString()}`;

  return (
    <iframe
      src={src}
      className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}
      style={{ height }}
      loading="lazy"
      allow="geolocation"
      title="Africoders Map"
    />
  );
}
