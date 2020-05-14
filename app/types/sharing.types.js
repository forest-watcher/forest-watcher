// @flow
import type { Area } from 'types/areas.types';
import type { Alert } from 'types/alerts.types';
import type { Report } from 'types/reports.types';
import type { Route } from 'types/routes.types';
import type { Basemap } from 'types/basemaps.types';
import type { ContextualLayer } from 'types/layers.types';

import type { Feature, Polygon } from '@turf/helpers';
import type { LayerType } from 'helpers/layer-store/layerFilePaths';

/**
 * Type representing a request to create a SharingBundle using a subset of the user's local data
 */
export type ExportBundleRequest = {|
  /**
   * Areas matching these IDs will be included in the resulting bundle, along with any intersecting:
   * (i) alerts,
   * (ii) basemap files (default and custom), along with metadata for any included custom basemaps
   * (iii) layer files (default and custom), along with metadata for any included custom layers
   */
  areaIds: Array<string>,

  /**
   * Custom basemaps matching these IDs will have their metadata included in the resulting bundle. Also, any files
   * associated with basemaps (default or custom) matching these IDs will be included.
   */
  basemapIds: Array<string>,

  /**
   * Custom layers matching these IDs will have their metadata included in the resulting bundle. Also, any files
   * associated with layers (default or custom) matching these IDs will be included.
   */
  layerIds: Array<string>,

  /**
   * Reports matching these IDs will be included in the resulting bundle. No tile data is included.
   */
  reportIds: Array<string>,

  /**
   * Routes matching these IDs will be included in the resulting bundle, along with any intersecting:
   * (i) basemap files (default and custom), along with metadata for any included custom basemaps
   * (ii) layer files (default and custom), along with metadata for any included custom layers
   */
  routeIds: Array<string>
|};

/**
 * Type representing the result of importing a sharing bundle
 */
export type ImportBundleResult = {|
  // TODO
|};

export type LayerFile = {|
  path: string,

  type: LayerType,

  /**
   * Unique identifier for the layer
   */
  layerId: string,

  /**
   * The smallest quadtree tile enclosing the region represented by this LayerFile
   */
  tileXYZ: [number, number, number],

  /**
   * Custom contextual layers will have an array of associated files e.g. gpx, xml, geojson
   *
   * For tile-based layers this will be null.
   */
  subFiles?: ?Array<string>,

  /**
   * Size in bytes of this LayerFile and its subfiles
   */
  size: number,

  /**
   * If the file represents a geographic extent, then this holds the boundaries of that extent
   */
  polygon?: ?Feature<Polygon>
|};

/**
 * Manifest of files relating to basemaps and contextual layers
 */
export type SharingBundleManifest = {|
  layerFiles: Array<LayerFile>
|};

/**
 * Type representing a sharing bundle that can be serialised in order to be exported, and then serialised for import
 * into another app
 */
export type SharingBundle = {|
  version: number,
  alerts: Array<Alert>,
  areas: Array<Area>,
  basemaps: Array<Basemap>,
  layers: Array<ContextualLayer>,
  manifest: SharingBundleManifest,
  reports: Array<Report>,
  routes: Array<Route>
|};

export type UnpackedSharingBundle = {|
  path: string,
  data: SharingBundle
|};
