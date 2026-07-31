import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { CityMapProps, MapMarker } from "./types";

const COLORS: Record<MapMarker["tone"], string> = {
  resolved: "#22C55E",
  pending: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
  info: "#2347C6",
};

export default function CityMapImpl({
  markers,
  center = [19.076, 72.8777],
  zoom = 12,
  className = "h-[520px] w-full",
}: CityMapProps) {
  const points = useMemo(
    () => markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng)),
    [markers],
  );

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="size-full overflow-hidden rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((marker) => (
          <CircleMarker
            key={marker.id}
            center={[marker.lat, marker.lng]}
            radius={marker.radius ?? 9}
            pathOptions={{
              color: COLORS[marker.tone],
              fillColor: COLORS[marker.tone],
              fillOpacity: 0.65,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {marker.title}
            </Tooltip>
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{marker.title}</p>
                {marker.subtitle ? <p className="text-xs">{marker.subtitle}</p> : null}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
