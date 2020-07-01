// @flow
import type { Basemap } from 'types/basemaps.types';
import type { File } from 'types/file.types';
import type { ContextualLayer } from 'types/layers.types';

import Constants from 'config/constants';

type GFWFile = Basemap | File | ContextualLayer;
type ValidityResponse = {
  valid: boolean,
  alreadyTaken: boolean
};

/**
 * fileNameIsValid - given file metadata + currently existing files, attempts to
 * determine if the filename is valid.
 *
 * To be valid, it must:
 * - Be non-nullish
 * - Be below the maximumLength character limit.
 * - Not conflict with an existing name UNLESS the id matches the file we're checking.
 *
 * @param {string} fileId
 * @param {string} fileName
 * @param {Array<GFWFile>} existingFiles
 * @param {number} maximumLength
 */
export default function fileNameIsValid(
  fileId: string,
  fileName: ?string,
  existingFiles: Array<GFWFile>,
  maximumLength: number = Constants.layerMaxNameLength
): ValidityResponse {
  if (!fileName || fileName.length === 0 || fileName.length > maximumLength) {
    return {
      valid: false,
      alreadyTaken: false
    };
  }

  const matchingFile = existingFiles.find(mappingFile => {
    // We also make sure we're not conflicting with ourself here...
    // Because the file is added before the screen disappears if we don't make
    // sure the "matches" id is different to the currently adding files id
    // then the duplicate name message is shown as the screen is dismissing on iOS
    return mappingFile.name === fileName && mappingFile.id !== fileId;
  });

  const nameAlreadyTaken = !!matchingFile;

  return {
    valid: !nameAlreadyTaken,
    alreadyTaken: nameAlreadyTaken
  };
}
