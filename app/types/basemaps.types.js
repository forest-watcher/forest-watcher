// @flow
import type { BasemapFile } from 'types/sharing.types';

export type Basemap = {
  isMapboxStyle: boolean,
  id: string,
  styleURL?: string,
  name: string,
  image: number,
  tileUrl: ?string,
  size: ?number
};

export type BasemapsState = {
  importedBasemaps: Array<Basemap>,
  importError: ?Error,
  importing: boolean
};

export type BasemapsAction = ImportBasemapRequest | ImportBasemapCommit | ImportBasemapClear | ImportBasemapRollback;

export type ImportBasemapRequest = { type: 'basemaps/IMPORT_BASEMAP_REQUEST' };
export type ImportBasemapCommit = { type: 'basemaps/IMPORT_BASEMAP_COMMIT', payload: BasemapFile };
export type ImportBasemapClear = { type: 'basemaps/IMPORT_BASEMAP_CLEAR' };
export type ImportBasemapRollback = { type: 'basemaps/IMPORT_BASEMAP_ROLLBACK', payload: ?Error };
