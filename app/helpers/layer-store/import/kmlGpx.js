// @flow
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';

import { storeGeoJson } from 'helpers/layer-store/storeLayerFiles';

import convertToGeoJSON from './convertToGeoJSON';

export default async function importKMLOrGPXFile(
  file: File & { uri: string },
  fileName: string,
  fileExtension: string
): Promise<LayerFile> {
  const geoJSON = await convertToGeoJSON(file.uri, fileExtension);
  const importedFile = await storeGeoJson(file.id, geoJSON);

  return importedFile;
}
