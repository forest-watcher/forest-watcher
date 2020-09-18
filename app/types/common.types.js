// @flow

import type { Feature, Geometry } from '@turf/helpers';

export type Coordinates = {
  latitude: number,
  longitude: number
};

export type CoordinatesFormat = 'decimal' | 'degrees' | 'utm';

/**
 * GeoJSON feature properties used by the app when drawing alerts
 */
export type AlertFeatureProperties = {|
  type: 'alert',
  lat: string,
  long: string,
  clusterId: 'reported' | 'recent' | 'other',
  datasetId: string,
  name: string,
  date: number,
  icon: string,
  reported: boolean,
  selected: boolean,
  cluster?: boolean
|};

/**
 * GeoJSON feature properties used by the app when drawing reports
 */
export type ReportFeatureProperties = {|
  type: 'report',
  selected: boolean,
  icon: string,
  date: number,
  name: string,
  imported: boolean,
  // need to pass these as strings as they are rounded in onShapeSourcePressed method.
  lat: string,
  long: string,
  featureId: string,
  reportAreaName: string,
  cluster?: boolean
|};

/**
 * GeoJSON feature properties used by the app when drawing routes
 */
export type RouteFeatureProperties = {|
  type: 'route',
  name: string,
  date: ?number,
  featureId: string
|};

// These are properties objects we attach to GeoJson features and give to Mapbox - we get them back from events
export type MapItemFeatureProperties = AlertFeatureProperties | ReportFeatureProperties | RouteFeatureProperties;
export type MapboxFeaturePressEvent<P> = {
  features: Array<Feature<Geometry, P>>,
  coordinates: Coordinates
};
