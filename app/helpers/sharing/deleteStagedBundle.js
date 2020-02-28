// @flow

import type { UnpackedSharingBundle } from 'types/sharing.types';
import FWError from 'helpers/fwError';

/**
 * Completely clears the staged bundle from disk
 *
 * @param bundle - The staged bundle to clear
 */
export default function deleteStagedBundle(bundle: UnpackedSharingBundle): Promise<void> {
  throw new FWError('Not yet implemented');
}
