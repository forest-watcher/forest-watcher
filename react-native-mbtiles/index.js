// @flow
import type { MBTileBasemapMetadata } from './types.js';

import { NativeModules } from 'react-native';

const { ReactNativeMBTiles } = NativeModules;

export default ReactNativeMBTiles;
export type { MBTileBasemapMetadata };
