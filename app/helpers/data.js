// @flow

import i18n from 'i18next';

/**
 * Converts a byte count to a readable byte amount (e.g. 3mb)
 * @param {number} bytes - The byte count to format
 * @return {string} A localised, readable version of the byte count
 */
export function formatBytes(bytes: number): string {
  const digitGroup = bytes < 1 ? 0 : Math.floor(Math.log10(bytes) / Math.log10(1024));
  const value = bytes / Math.pow(1024, digitGroup);

  const localisationKeys = [
    'commonText.fileSizes.bytes',
    'commonText.fileSizes.kiloBytes',
    'commonText.fileSizes.megaBytes',
    'commonText.fileSizes.gigaBytes',
    'commonText.fileSizes.teraBytes'
  ];

  // Don't show decimal places for non-integer bytes
  return i18n.t(localisationKeys[digitGroup], { size: value.toFixed(digitGroup === 0 ? 0 : 1) });
}
