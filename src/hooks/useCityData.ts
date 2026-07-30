import { useQuery } from "@tanstack/react-query";
import {
  fetchAlerts,
  fetchDepartments,
  fetchFacilities,
  fetchMapPoints,
  fetchPollution,
  fetchTraffic,
  fetchWards,
  fetchWeather,
} from "@/services/cityData";

const STALE = 60_000;

export const useWards = () =>
  useQuery({ queryKey: ["wards"], queryFn: fetchWards, staleTime: STALE });

export const useDepartments = () =>
  useQuery({ queryKey: ["departments"], queryFn: fetchDepartments, staleTime: STALE });

export const useWeather = () =>
  useQuery({ queryKey: ["weather"], queryFn: fetchWeather, staleTime: STALE });

export const useTraffic = () =>
  useQuery({ queryKey: ["traffic"], queryFn: fetchTraffic, staleTime: STALE });

export const usePollution = () =>
  useQuery({ queryKey: ["pollution"], queryFn: fetchPollution, staleTime: STALE });

export const useAlerts = () =>
  useQuery({ queryKey: ["alerts"], queryFn: fetchAlerts, staleTime: STALE });

export const useFacilities = () =>
  useQuery({ queryKey: ["facilities"], queryFn: fetchFacilities, staleTime: STALE });

export const useMapPoints = () =>
  useQuery({ queryKey: ["map-points"], queryFn: fetchMapPoints, staleTime: STALE });