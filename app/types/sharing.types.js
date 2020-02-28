// @flow
import type { Area } from 'types/areas.types';
import type { Report } from 'types/reports.types';

/**
 * Type representing a request to create a SharingBundle using a subset of the user's local data
 */
export type ExportBundleRequest = {|
  areaIds: Array<string>,
  baseDirectory: string,
  reportIds: Array<string>
|};

/**
 * Type representing the result of importing a sharing bundle
 */
export type ImportBundleResult = {|
  // TODO
|};

/**
 * Type representing a sharing bundle that can be serialised in order to be exported, and then serialised for import
 * into another app
 */
export type SharingBundle = {|
  version: number,
  areas: Array<Area>,
  reports: Array<Report>
|};

export type UnpackedSharingBundle = {|
  baseDirectory: string,
  bundleFile: string,
  bundle: SharingBundle
|};
