// @flow

export type Basemap = {
  isImported: boolean,
  // The unique identifier for this basemap.
  id: string,
  styleURL?: string,
  // The given name of the basemap.
  name: string,
  image?: number,
  tileUrl?: ?string,
  // Where the file is saved within the app's documents directory.
  path?: string,
  // The size of this basemap on disk.
  size?: number
};

export type BasemapsState = {
  importedBasemaps: Array<Basemap>,
  importError: ?Error,
  importing: boolean
};

export type MBTileBasemapMetadata = {
  minZoomLevel: number,
  maxZoomLevel: number,
  isVector: boolean,
  tms: boolean,
  tileSize: number,
  attribution: string,
  layersJson: string
};

export type BasemapsAction = ImportBasemapRequest | ImportBasemapCommit | ImportBasemapClear | ImportBasemapRollback;

export type ImportBasemapRequest = { type: 'basemaps/IMPORT_BASEMAP_REQUEST' };
export type ImportBasemapCommit = { type: 'basemaps/IMPORT_BASEMAP_COMMIT', payload: Basemap };
export type ImportBasemapClear = { type: 'basemaps/IMPORT_BASEMAP_CLEAR' };
export type ImportBasemapRollback = { type: 'basemaps/IMPORT_BASEMAP_ROLLBACK', payload: ?Error };
