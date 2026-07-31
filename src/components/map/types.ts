export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  tone: "resolved" | "pending" | "high" | "critical" | "info";
  radius?: number;
}

export interface CityMapProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}
