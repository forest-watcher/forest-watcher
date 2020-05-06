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

export type AlertDatasetConfig = {
  id: string,
  nameKey: string,
  requestThreshold: number, // days
  recencyThreshold: number, // days
  filterThresholdOptions: Array<number>,
  filterThresholdUnits: 'days' | 'months',
  iconPrefix: string,
  color: string,
  colorRecent: string,
  colorReported: string
};

export type CoordinatesFormat = 'decimal' | 'degrees' | 'utm';
