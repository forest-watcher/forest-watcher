// @flow

import type { LayerFile } from 'types/sharing.types';

export default function queryLayerFiles(query: {|
  whitelist: Array<string>,
  blacklist: Array<string>,
  region: Array<any>
|}): { [id: string]: LayerFile } {
  // TODO
  return {};
}
