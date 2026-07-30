import { Suspense, lazy } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import type { CityMapProps } from "./types";

const CityMapImpl = lazy(() => import("./CityMapImpl"));

function MapFallback({ className = "h-[520px] w-full" }: { className?: string }) {
  return <Skeleton className={`${className} rounded-2xl`} />;
}

export function CityMap(props: CityMapProps) {
  return (
    <ClientOnly fallback={<MapFallback className={props.className} />}>
      <Suspense fallback={<MapFallback className={props.className} />}>
        <CityMapImpl {...props} />
      </Suspense>
    </ClientOnly>
  );
}

export type { MapMarker } from "./types";