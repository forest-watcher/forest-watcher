// @flow

export type Coordinates = {
  latitude: number,
  longitude: number
};

export type Alert = {
  areaId: string,
  slug: string,
  long: number,
  lat: number,
  date: number
};

export type CoordinatesFormat = 'decimal' | 'degrees' | 'utm';
