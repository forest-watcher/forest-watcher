// @flow
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';

import { storeGeoJson } from 'helpers/layer-store/storeLayerFiles';
import togeojson from 'helpers/toGeoJSON';
import { readTextFile } from 'helpers/fileManagement';

export default async function importJsonFile(file: File & { uri: string }, fileName: string): Promise<LayerFile> {
  // Read from file so we can remove null geometries
  const fileContents = await readTextFile(file.uri);
  let geojson = JSON.parse(fileContents);

  if (geojson.type === 'Topology' && !!geojson.objects) {
    geojson = togeojson.topojson(geojson);
  }

  const importedFile = await storeGeoJson(file.id, geojson);

  return importedFile;
}
