// @flow

export type Coordinates = {
  latitude: number,
  longitude: number
};

export type CoordinatesFormat = 'decimal' | 'degrees' | 'utm';

export type MapFeature = {
  name: string,
  date: number,
  type: string,
  featureId: string,
  lat?: string,
  long?: string,
  reportAreaName?: string,
  imported?: boolean,
  icon?: any,
  selected?: boolean,
  reported?: boolean,
  clusterId?: string
};
