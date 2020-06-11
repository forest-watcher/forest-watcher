// @flow

import type { SharingBundle } from 'types/sharing.types';

import moment from 'moment';

export default function generateBundleName(bundle: SharingBundle) {
  const dateStr = moment(bundle.timestamp).format('DD_MMMM_YYYY_HHmm');
  return `Bundle_${dateStr}_Forest_Watcher`;
}
