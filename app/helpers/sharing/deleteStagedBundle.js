// @flow

import type { UnpackedSharingBundle } from 'types/sharing.types';

// $FlowFixMe
import RNFS from 'react-native-fs';

/**
 * Completely clears the staged bundle from disk
 *
 * @param bundle - The staged bundle to clear
 */
export default function deleteStagedBundle(bundle: UnpackedSharingBundle): Promise<void> {
  return RNFS.unlink(bundle.path);
}
