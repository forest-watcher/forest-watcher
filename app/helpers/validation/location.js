// @flow
import type { Coordinates } from 'types/common.types';

// returns true for valid lat lng values: { latitude: -1.00, longitude: 50.00 }
export function isValidLatLng(location: { latitude: string, longitude: string } | Coordinates) {
  return !isNaN(Number.parseFloat(location.latitude)) && !isNaN(Number.parseFloat(location.longitude));
}

// returns true for valid lat lng array: [50.00, -1.00]
export function isValidLatLngArray(location: [string, string] | [number, number]) {
  return !isNaN(Number.parseFloat(location[1])) && !isNaN(Number.parseFloat(location[0]));
}
