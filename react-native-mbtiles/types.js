// @flow

export type MBTileBasemapMetadata = {
  minZoomLevel: number,
  maxZoomLevel: number,
  isVector: boolean,
  tms: boolean,
  tileSize: number,
  attribution: string,
  layersJson: string
};
