// @flow
import RNFS from 'react-native-fs';

/**
 * Directory on the device where the bundle will be prepared
 */
const BUNDLE_DEFAULT_STAGING_DIR: string = `${RNFS.TemporaryDirectoryPath.replace(/\/$/, '')}/bundle-staging`;
// Stripped the trailing slash from `RNFS.TemporaryDirectoryPath` because it's presence is platform-dependent

export default async function createTemporaryStagingDirectory(): Promise<string> {
  const outputPath = `${BUNDLE_DEFAULT_STAGING_DIR}/bundle-${Date.now().toString()}`;
  await RNFS.mkdir(outputPath);
  return outputPath;
}
