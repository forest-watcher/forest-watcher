// @flow
export type Basemap = {
  isImported: boolean,
  id: string,
  styleURL?: string,
  name: string,
  image: number,
  tileUrl: ?string
};

export type BasemapsState = {
  importedBasemaps: Array<Basemap>
};

export type BasemapsAction = ADD_BASEMAP;

export type ADD_BASEMAP = { type: 'basemaps/ADD_BASEMAP', payload: { basemap: Basemap } };
