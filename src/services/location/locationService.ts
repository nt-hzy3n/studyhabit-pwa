import { Geolocation, type Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  formatted?: string;
}

export const locationService = {
  /**
   * Checks if Geolocation permission is granted
   */
  async checkPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const permission = await Geolocation.checkPermissions();
        if (permission.location === 'granted') {
          return true;
        }
        const request = await Geolocation.requestPermissions();
        return request.location === 'granted';
      } catch (err) {
        console.warn('[LocationService] Native permission check error:', err);
      }
    }
    return true; // Fallback to browser prompt
  },

  /**
   * Obtains current GPS coordinates using Capacitor Geolocation (Native) or browser Geolocation API
   */
  async getCurrentPosition(): Promise<GeoLocationData> {
    if (Capacitor.isNativePlatform()) {
      try {
        await this.checkPermission();
        const coordinates: Position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        });

        return {
          latitude: coordinates.coords.latitude,
          longitude: coordinates.coords.longitude,
          accuracy: Math.round(coordinates.coords.accuracy * 10) / 10,
          altitude: coordinates.coords.altitude,
          altitudeAccuracy: coordinates.coords.altitudeAccuracy,
          heading: coordinates.coords.heading,
          speed: coordinates.coords.speed,
          timestamp: coordinates.timestamp,
          formatted: `${coordinates.coords.latitude.toFixed(6)}, ${coordinates.coords.longitude.toFixed(6)} (±${Math.round(coordinates.coords.accuracy)}m)`,
        };
      } catch (err: any) {
        console.warn('[LocationService] Native geolocation error, attempting web fallback:', err);
      }
    }

    // Fallback: browser navigator.geolocation
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Thiết bị hoặc trình duyệt không hỗ trợ định vị GPS'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy * 10) / 10,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            formatted: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)} (±${Math.round(position.coords.accuracy)}m)`,
          });
        },
        (error) => {
          let msg = 'Không thể xác định vị trí GPS.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Quyền truy cập vị trí GPS bị từ chối. Vui lòng cấp quyền trong Cài đặt.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Tín hiệu vệ tinh GPS không khả dụng hoặc bị che khuất.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Quá thời gian chờ lấy vị trí GPS.';
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  },
};
