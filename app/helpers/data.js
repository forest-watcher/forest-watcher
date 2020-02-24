import i18n from 'locales';

/**
 * Converts a byte count to a readable byte amount (e.g. 3mb)
 * @param {number} bytes - The byte count to format
 * @return {string} A localised, readable version of the byte count
 */
export function formatBytes(bytes: number) {

  const digitGroup = bytes < 1 ? 0 : Math.floor(Math.log10(bytes)/Math.log10(1024));
  const value = bytes/Math.pow(1024, digitGroup);

  let localisationKeys = [
    'commonText.fileSizes.bytes',
    'commonText.fileSizes.kiloBytes',
    'commonText.fileSizes.megaBytes',
    'commonText.fileSizes.gigaBytes',
    'commonText.fileSizes.teraBytes',
  ]

  return i18n.t(localisationKeys[digitGroup], { size: value.toFixed(1) })
}