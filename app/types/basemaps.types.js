// @flow
export type Basemap = {
  isMapboxStyle: boolean,
  styleURL?: string,
  id: string,
  name: string,
  image: number
};

export type BasemapsState = {
  gfwBasemaps: Array<Basemap>,
  importedBasemaps: Array<Basemap>
};

export type BasemapsAction = ADD_BASEMAP;

export type ADD_BASEMAP = { type: 'basemaps/ADD_BASEMAP', payload: { basemap: Basemap } };
