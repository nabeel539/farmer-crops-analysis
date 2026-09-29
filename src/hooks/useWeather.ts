'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  geocodeLocation,
  fetchLiveWeatherData,
  WeatherCurrent,
  WeatherDailyForecast,
  AgriSprayAssessment,
  DiseaseRiskAssessment,
  LocationCoordinates,
} from '@/services/weatherService';

interface CachedWeatherData {
  dateKey: string; // YYYY-MM-DD
  timestamp: number;
  coords: LocationCoordinates;
  current: WeatherCurrent;
  daily: WeatherDailyForecast[];
  sprayAssessment: AgriSprayAssessment;
  diseaseRisk: DiseaseRiskAssessment;
}

const CACHE_PREFIX = 'agri_weather_cache_v2_';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useWeather(locationQuery: string = 'Karnal') {
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);
  const [current, setCurrent] = useState<WeatherCurrent | null>(null);
  const [daily, setDaily] = useState<WeatherDailyForecast[]>([]);
  const [sprayAssessment, setSprayAssessment] = useState<AgriSprayAssessment | null>(null);
  const [diseaseRisk, setDiseaseRisk] = useState<DiseaseRiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getCacheKey = (loc: string) => `${CACHE_PREFIX}${loc.trim().toLowerCase()}`;
  const getTodayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const loadFromCache = useCallback((query: string): boolean => {
    try {
      const key = getCacheKey(query);
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      if (!raw) return false;

      const cached: CachedWeatherData = JSON.parse(raw);
      const isSameDay = cached.dateKey === getTodayKey();
      const isWithin24Hours = Date.now() - cached.timestamp < ONE_DAY_MS;

      if (isSameDay || isWithin24Hours) {
        setCoords(cached.coords);
        setCurrent(cached.current);
        setDaily(cached.daily);
        setSprayAssessment(cached.sprayAssessment);
        setDiseaseRisk(cached.diseaseRisk);
        setLastUpdated(new Date(cached.timestamp));
        setIsLoading(false);
        return true;
      }
    } catch {
      // Ignore cache parse error
    }
    return false;
  }, []);

  const saveToCache = (query: string, data: Omit<CachedWeatherData, 'dateKey' | 'timestamp'>) => {
    try {
      const key = getCacheKey(query);
      const payload: CachedWeatherData = {
        ...data,
        dateKey: getTodayKey(),
        timestamp: Date.now(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(payload));
      }
    } catch {
      // Ignore storage errors
    }
  };

  const fetchWeather = useCallback(async (query: string, force: boolean = false) => {
    // Check daily cache first if not forced
    if (!force) {
      const hasCached = loadFromCache(query);
      if (hasCached) {
        return;
      }
    }

    if (force) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const geo = await geocodeLocation(query || 'Karnal');
      setCoords(geo);

      const weather = await fetchLiveWeatherData(geo.latitude, geo.longitude);
      setCurrent(weather.current);
      setDaily(weather.daily);
      setSprayAssessment(weather.sprayAssessment);
      setDiseaseRisk(weather.diseaseRisk);
      const now = new Date();
      setLastUpdated(now);

      saveToCache(query, {
        coords: geo,
        current: weather.current,
        daily: weather.daily,
        sprayAssessment: weather.sprayAssessment,
        diseaseRisk: weather.diseaseRisk,
      });
    } catch (err: any) {
      console.error('Failed to load live weather:', err);
      setError('Live weather forecast could not be loaded.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [loadFromCache]);

  // 1. Initial daily check on location query change
  useEffect(() => {
    fetchWeather(locationQuery, false);
  }, [locationQuery, fetchWeather]);

  // 2. 24-Hour Daily Periodic Timer (Auto-updates once a day)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchWeather(locationQuery, true);
    }, ONE_DAY_MS);

    return () => clearInterval(timer);
  }, [locationQuery, fetchWeather]);

  return {
    coords,
    current,
    daily,
    sprayAssessment,
    diseaseRisk,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refreshWeather: () => fetchWeather(locationQuery, true),
  };
}
