// @flow
import type { MBTileBasemapMetadata } from './types.js';
import MBTilesSource from './tileSource';

import { NativeModules } from 'react-native';

const { ReactNativeMBTiles } = NativeModules;

export default ReactNativeMBTiles;
export { MBTilesSource };
export type { MBTileBasemapMetadata };
