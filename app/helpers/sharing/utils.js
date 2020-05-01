// @flow

import i18n from 'i18next';
import { formatBytes } from 'helpers/data';

/**
 * getShareButtonText - given the total number of routes to share, returns the
 * text that should be shown in the button.
 *
 * @param {number} totalToShare the amount of routes that should be shared.
 * @param {?number} bundleSize the size of the shareable bundle.
 *
 * @returns {string}
 */
export const getShareButtonText = (type: string, totalToShare: number, bundleSize: ?number): string => {
  if (totalToShare === 0) {
    return i18n.t('sharing.noneSelected', { type: type });
  }

  let transifexKey = 'sharing.multiple';

  if (totalToShare === 1) {
    transifexKey = 'sharing.one';
  }

  return i18n.t(transifexKey, {
    bundleSize: bundleSize !== undefined ? formatBytes(bundleSize) : i18n.t('commonText.calculating'),
    type: type
  });
};
