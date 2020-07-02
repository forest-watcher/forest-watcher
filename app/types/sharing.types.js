// @flow
import type { Area } from 'types/areas.types';
import type { Alert } from 'types/alerts.types';
import type { Report, Template } from 'types/reports.types';
import type { Route } from 'types/routes.types';
import type { Layer } from 'types/layers.types';

import type { Feature, Polygon } from '@turf/helpers';
import type { ReportAttachmentType } from 'helpers/report-store/reportFilePaths';

export type DownloadDataType = 'area' | 'route';
export type LayerType = 'basemap' | 'contextual_layer';

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
 * Whether to import:
 * - all layer files (plus metadata) in the bundle
 * - only layer files (plus metadata) intersecting areas and routes that were imported
 * - no layers at all
 */
export type LayerFileImportStrategy = 'all' | 'intersecting';
export type LayerImportStrategy = {
  metadata: boolean,
  files: LayerFileImportStrategy // only relevent if metadata = true
};

/**
 * Type representing a request to import a subset of a SharingBundle
 */
export type ImportBundleRequest = {|
  /**
   * Flag indicating whether or not to import all the areas in the bundle
   */
  areas: boolean,

  /**
   * Strategy to use when importing basemap files
   */
  customBasemaps: LayerImportStrategy,

  /**
   * Strategy to use when importing custom contextual layers
   */
  customContextualLayers: LayerImportStrategy,

  /**
   * Strategy to use when importing GFW contextual layers
   */
  gfwContextualLayers: LayerImportStrategy,

  /**
   * Flag indicating whether or not to import all the reports in the bundle
   */
  reports: boolean,

  /**
   * Flag indicating whether or not to import all the routes in the bundle
   */
  routes: boolean
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

export type ReportFile = {|
  path: string,
  reportName: string,
  questionName: string,
  type: ReportAttachmentType,
  size: number
|};

/**
 * Manifest of files relating to basemaps and contextual layers
 */
export type SharingBundleManifest = {|
  layerFiles: Array<LayerFile>,
  reportFiles: Array<ReportFile>
|};

/**
 * Type representing a sharing bundle that can be serialised in order to be exported, and then serialised for import
 * into another app
 */
export type SharingBundle = {|
  version: number,
  timestamp: number,
  alerts: Array<Alert>,
  areas: Array<Area>,
  basemaps: Array<Layer>,
  layers: Array<Layer>,
  manifest: SharingBundleManifest,
  reports: Array<Report>,
  routes: Array<Route>,
  templates: { [string]: Template }
|};

export type UnpackedSharingBundle = {|
  path: string,
  data: SharingBundle
|};
